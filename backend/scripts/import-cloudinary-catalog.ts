import path from 'node:path';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { z } from 'zod';
import { cloudinary } from '../src/config/cloudinary.js';
import { backendRoot, isCloudinaryConfigured } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { CategoryModel } from '../src/models/category.model.js';
import { ProductModel } from '../src/models/product.model.js';

const pageSchema = z.object({
  resources: z.array(
    z.object({
      public_id: z.string(),
      secure_url: z.string().url(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    }),
  ),
  next_cursor: z.string().optional(),
});

type CloudinaryResource = z.infer<typeof pageSchema>['resources'][number];
type CloudinaryPage = z.infer<typeof pageSchema>;

const folderAliases: Readonly<Record<string, string>> = {
  'acrylic-trophies': 'acrylic-trophies',
  attachments: 'attachments',
  'base-and-accessories': 'base-and-accessories',
  'ca-awards': 'ca-awards',
  'fiber-cups': 'fiber-cups',
  'fiber-cups-new': 'fiber-cups',
  frames: 'frames',
  'iron-cups': 'iron-cups',
  'iron-cups-new': 'iron-cups',
  'la-aca-ra-awards': 'la-aca-ra-awards',
  'metal-cups': 'metal-cups',
  'metal-cups-new': 'metal-cups',
  'mp-trophies': 'mp-trophies',
  'pf-trophies': 'pf-trophies',
  'plastic-cups': 'plastic-cups',
  'plastic-cups-new': 'plastic-cups',
  'wall-awards': 'wall-awards',
  'wooden-cups-new': 'wooden-cups',
  'wooden-plastic-cups': 'wooden-plastic-cups',
};

const legacyFolderPriority = [
  'fiber-cups',
  'iron-cups',
  'metal-cups',
  'plastic-cups',
  'attachments',
  'wooden-plastic-cups',
  'acrylic-trophies',
  'ca-awards',
  'frames',
  'la-aca-ra-awards',
  'mp-trophies',
  'pf-trophies',
  'wall-awards',
  'base-and-accessories',
] as const;

function normalizedSku(value: string): string {
  return value
    .replace(/-removebg-preview$/i, '')
    .trim()
    .slice(0, 100)
    .toUpperCase();
}

function productSlug(sku: string): string {
  const base = sku
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 220);
  const suffix = createHash('sha256').update(sku).digest('hex').slice(0, 8);
  return `${base || 'product'}-${suffix}`;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getResourcePage(nextCursor?: string): Promise<CloudinaryPage> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const rawPage: unknown = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        prefix: 'deltatrophies/',
        max_results: 500,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      });
      return pageSchema.parse(rawPage);
    } catch (error) {
      lastError = error;
      if (attempt < 4) await wait(attempt * 1_000);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Cloudinary inventory request failed');
}

async function getCloudinaryResources(): Promise<CloudinaryResource[]> {
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const page = await getResourcePage(nextCursor);
    resources.push(...page.resources);
    nextCursor = page.next_cursor;
  } while (nextCursor);

  return resources;
}

async function getLegacyCategoryLookup(): Promise<Map<string, string>> {
  const catalogueRoot = path.join(backendRoot, 'uploads', 'delta-catalogue');
  const candidates = new Map<string, Set<string>>();

  for (const folder of Object.keys(folderAliases)) {
    const folderPath = path.join(catalogueRoot, folder);
    let entries;
    try {
      entries = await readdir(folderPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !/\.(?:jpe?g|png|webp|gif)$/i.test(entry.name)) continue;
      const sku = normalizedSku(path.parse(entry.name).name);
      const folders = candidates.get(sku) ?? new Set<string>();
      folders.add(folder);
      candidates.set(sku, folders);
    }
  }

  return new Map(
    [...candidates].map(([sku, folders]) => {
      const folder = legacyFolderPriority.find((candidate) => folders.has(candidate));
      return [sku, folder ? (folderAliases[folder] ?? '') : ''] as const;
    }),
  );
}

function resolveCategorySlug(
  resource: CloudinaryResource,
  legacyLookup: ReadonlyMap<string, string>,
): string | undefined {
  const parts = resource.public_id.split('/');
  if (parts[0] !== 'deltatrophies') return undefined;
  if (parts[1] === 'products' && parts.length === 4) return folderAliases[parts[2] ?? ''];
  if (parts.length === 2) return legacyLookup.get(normalizedSku(parts[1] ?? ''));
  return undefined;
}

async function main(): Promise<void> {
  if (!isCloudinaryConfigured) throw new Error('Cloudinary credentials are required');

  const [resources, legacyLookup] = await Promise.all([
    getCloudinaryResources(),
    getLegacyCategoryLookup(),
  ]);
  await connectDatabase();

  const categories = await CategoryModel.find({ isActive: true }).select('_id slug').lean().exec();
  const categoryIds = new Map(categories.map((category) => [category.slug, category._id]));
  const products = new Map<
    string,
    { resource: CloudinaryResource; categorySlug: string; structured: boolean }
  >();

  for (const resource of resources) {
    const categorySlug = resolveCategorySlug(resource, legacyLookup);
    if (!categorySlug || !categoryIds.has(categorySlug)) continue;
    const sku = normalizedSku(resource.public_id.split('/').at(-1) ?? '');
    if (!sku) continue;
    const structured = resource.public_id.includes('/products/');
    const existing = products.get(sku);
    if (!existing || (structured && !existing.structured)) {
      products.set(sku, { resource, categorySlug, structured });
    }
  }

  if (products.size === 0) throw new Error('No catalogue images could be mapped');

  const operations = [...products].map(([sku, product]) => {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Category not found: ${product.categorySlug}`);

    return {
      updateOne: {
        filter: { sku },
        update: {
          $setOnInsert: {
            name: sku.replaceAll('_', ' '),
            sku,
            slug: productSlug(sku),
            category: categoryId,
            inStock: true,
            isActive: true,
            images: [
              {
                url: product.resource.secure_url,
                publicId: product.resource.public_id,
                ...(product.resource.width ? { width: product.resource.width } : {}),
                ...(product.resource.height ? { height: product.resource.height } : {}),
              },
            ],
          },
        },
        upsert: true,
      },
    };
  });

  const result = await ProductModel.bulkWrite(operations, { ordered: false });
  logger.info(
    {
      mapped: products.size,
      inserted: result.upsertedCount,
      alreadyPresent: result.matchedCount,
      cloudinaryResources: resources.length,
    },
    'Cloudinary catalogue imported',
  );
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'Cloudinary catalogue import failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
