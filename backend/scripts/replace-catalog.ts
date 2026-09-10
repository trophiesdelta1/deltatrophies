import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { fileTypeFromFile } from 'file-type';
import { cloudinary } from '../src/config/cloudinary.js';
import { backendRoot, isCloudinaryConfigured } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { CategoryModel } from '../src/models/category.model.js';
import { ProductModel } from '../src/models/product.model.js';
import { createSlug } from '../src/utils/slug.js';
import {
  categorySeoBySlug,
  curatedProductName,
  productModelGroup,
  productSearchTerms,
  productSeoDescription,
} from './catalog-seo-data.js';

const cloudinaryRoot = 'deltatrophies/products';
const uploadConcurrency = 5;
const ignoredSourceFolders = new Set(['FRAMES']);

interface CategoryDefinition {
  folder: string;
  name: string;
  slug: string;
  displayOrder: number;
  skuSuffix: string;
}

interface LocalProduct {
  sourcePath: string;
  sourceBytes: number;
  fileName: string;
  name: string;
  sku: string;
  slug: string;
  category: CategoryDefinition;
  displayOrder: number;
  publicId: string;
}

interface UploadedProduct extends LocalProduct {
  image: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  };
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
}

const categoryDefinitions: readonly CategoryDefinition[] = [
  {
    folder: '1. PLASTIC CUPS ( PC )',
    name: 'Plastic Cups (PC)',
    slug: 'plastic-cups',
    displayOrder: 1,
    skuSuffix: 'PC',
  },
  {
    folder: '2. METAL CUPS',
    name: 'Metal Cups',
    slug: 'metal-cups',
    displayOrder: 2,
    skuSuffix: 'MC',
  },
  {
    folder: '3. METAL PLATES WITH BOX',
    name: 'Metal Plates with Box',
    slug: 'metal-plates-with-box',
    displayOrder: 3,
    skuSuffix: 'MP',
  },
  {
    folder: '4. PLASTIC FITTED ( PF )',
    name: 'Plastic Fitted (PF)',
    slug: 'plastic-fitted',
    displayOrder: 4,
    skuSuffix: 'PF',
  },
  {
    folder: '5. WOODEN MODEL ( WPW)',
    name: 'Wooden Models (WPW)',
    slug: 'wooden-models',
    displayOrder: 5,
    skuSuffix: 'WPW',
  },
  {
    folder: '6. ACRYLIC MODEL',
    name: 'Acrylic Models',
    slug: 'acrylic-models',
    displayOrder: 6,
    skuSuffix: 'AM',
  },
  {
    folder: '7. CORPORATE AWARDS ( CA )',
    name: 'Corporate Awards (CA)',
    slug: 'corporate-awards',
    displayOrder: 7,
    skuSuffix: 'CA',
  },
  {
    folder: '8. WOODEN AWRDS',
    name: 'Wooden Awards',
    slug: 'wooden-awards',
    displayOrder: 8,
    skuSuffix: 'WA',
  },
  {
    folder: '9. LA,ACA,RA,F, MODEL',
    name: 'Special Awards & Frames',
    slug: 'la-aca-ra-f-models',
    displayOrder: 9,
    skuSuffix: 'LARF',
  },
  {
    folder: '10. FIBRE CUPS (FC )',
    name: 'Fibre Cups (FC)',
    slug: 'fibre-cups',
    displayOrder: 10,
    skuSuffix: 'FC',
  },
  {
    folder: '11. IC MODEL',
    name: 'IC Models',
    slug: 'ic-models',
    displayOrder: 11,
    skuSuffix: 'IC',
  },
  {
    folder: '12. BASE AND ACS',
    name: 'Bases & Accessories',
    slug: 'bases-and-accessories',
    displayOrder: 12,
    skuSuffix: 'BA',
  },
] as const;

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalizeSku(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase().slice(0, 100);
}

function uniqueSku(baseSku: string, category: CategoryDefinition, used: Set<string>): string {
  let candidate = baseSku;
  let counter = 1;
  while (used.has(candidate)) {
    const suffix = counter === 1 ? category.skuSuffix : `${category.skuSuffix}-${counter}`;
    candidate = `${baseSku.slice(0, 99 - suffix.length)}-${suffix}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}

async function buildManifest(sourceRoot: string): Promise<LocalProduct[]> {
  const rootStats = await stat(sourceRoot);
  if (!rootStats.isDirectory())
    throw new Error(`Catalogue source is not a directory: ${sourceRoot}`);

  const sourceEntries = await readdir(sourceRoot, { withFileTypes: true });
  const sourceFolders = sourceEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const expectedFolders = new Set(categoryDefinitions.map((category) => category.folder));
  const unknownFolders = sourceFolders.filter(
    (folder) => !expectedFolders.has(folder) && !ignoredSourceFolders.has(folder),
  );
  const missingFolders = categoryDefinitions
    .map((category) => category.folder)
    .filter((folder) => !sourceFolders.includes(folder));

  if (unknownFolders.length > 0 || missingFolders.length > 0) {
    throw new Error(
      `Folder mismatch. Unknown: ${unknownFolders.join(', ') || 'none'}; missing: ${missingFolders.join(', ') || 'none'}`,
    );
  }

  const manifest: LocalProduct[] = [];
  const usedSkus = new Set<string>();
  let displayOrder = 0;

  for (const category of categoryDefinitions) {
    const categoryPath = path.join(sourceRoot, category.folder);
    const entries = await readdir(categoryPath, { withFileTypes: true });
    const nestedEntries = entries.filter((entry) => entry.isDirectory());
    if (nestedEntries.length > 0) {
      throw new Error(`Nested folders are not supported inside ${category.folder}`);
    }

    const fileNames = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((left, right) =>
        left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }),
      );
    if (fileNames.length === 0) throw new Error(`Category is empty: ${category.folder}`);

    for (const fileName of fileNames) {
      if (!/\.jpe?g$/i.test(fileName)) throw new Error(`Only JPG files are allowed: ${fileName}`);
      const sourcePath = path.join(categoryPath, fileName);
      const detectedType = await fileTypeFromFile(sourcePath);
      if (detectedType?.mime !== 'image/jpeg') throw new Error(`Invalid JPEG file: ${sourcePath}`);
      const sourceFile = await stat(sourcePath);
      const stem = path.parse(fileName).name;
      if (/[?&#\\%<>+]/.test(stem) || /[?&#\\%<>+]/.test(category.folder)) {
        throw new Error(`Cloudinary-incompatible path: ${category.folder}/${fileName}`);
      }
      const sku = uniqueSku(normalizeSku(stem), category, usedSkus);
      const name = curatedProductName(sku, category.slug);
      manifest.push({
        sourcePath,
        sourceBytes: sourceFile.size,
        fileName,
        name,
        sku,
        slug: createSlug(name, sku),
        category,
        displayOrder,
        publicId: `${cloudinaryRoot}/${category.folder}/${stem}`,
      });
      displayOrder += 1;
    }
  }

  const publicIds = new Set(manifest.map((product) => product.publicId));
  if (publicIds.size !== manifest.length)
    throw new Error('Duplicate Cloudinary public IDs detected');
  return manifest;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withRetry<T>(label: string, operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 4) await wait(attempt * 1_500);
    }
  }
  throw new Error(`${label} failed after 4 attempts`, { cause: lastError });
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index] as T, index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

async function uploadProduct(product: LocalProduct): Promise<UploadedProduct> {
  const result = await withRetry(`Upload ${product.category.folder}/${product.fileName}`, () =>
    cloudinary.uploader.upload(product.sourcePath, {
      folder: `${cloudinaryRoot}/${product.category.folder}`,
      public_id: path.parse(product.fileName).name,
      resource_type: 'image',
      type: 'upload',
      overwrite: true,
      invalidate: true,
      unique_filename: false,
      use_filename: false,
    }),
  );
  const upload = result;
  if (
    upload.public_id !== product.publicId ||
    !upload.secure_url ||
    !upload.width ||
    !upload.height ||
    upload.bytes !== product.sourceBytes
  ) {
    throw new Error(`Cloudinary verification failed for ${product.publicId}`);
  }
  return {
    ...product,
    image: {
      url: upload.secure_url,
      publicId: upload.public_id,
      width: upload.width,
      height: upload.height,
    },
  };
}

function useVerifiedExistingAsset(
  product: LocalProduct,
  resource: CloudinaryResource | undefined,
): UploadedProduct | undefined {
  if (
    resource?.public_id !== product.publicId ||
    resource.bytes !== product.sourceBytes ||
    !resource.width ||
    !resource.height ||
    !resource.secure_url
  ) {
    return undefined;
  }
  return {
    ...product,
    image: {
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
    },
  };
}

async function listExistingCatalogueResources(): Promise<CloudinaryResource[]> {
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;
  do {
    const page = (await withRetry('Cloudinary inventory', () =>
      cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        prefix: 'deltatrophies/',
        max_results: 500,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      }),
    )) as { resources: CloudinaryResource[]; next_cursor?: string };
    resources.push(
      ...page.resources.filter((resource) => {
        const depth = resource.public_id.split('/').length;
        return resource.public_id.startsWith(`${cloudinaryRoot}/`) || depth === 2;
      }),
    );
    nextCursor = page.next_cursor;
  } while (nextCursor);
  return resources;
}

async function writeDatabaseBackup(): Promise<string> {
  const backupDirectory = path.join(backendRoot, '.catalog-backups');
  await mkdir(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `catalog-${timestamp}.json`);
  const [categories, products] = await Promise.all([
    CategoryModel.find().lean().exec(),
    ProductModel.find().lean().exec(),
  ]);
  await writeFile(
    backupPath,
    JSON.stringify({ createdAt: new Date().toISOString(), categories, products }, null, 2),
    'utf8',
  );
  return backupPath;
}

async function replaceDatabaseCatalog(products: UploadedProduct[]): Promise<void> {
  await mongoose.connection.transaction(async (session) => {
    const categoryIds = new Map<string, mongoose.Types.ObjectId>();
    for (const category of categoryDefinitions) {
      const categorySeo = categorySeoBySlug[category.slug];
      if (!categorySeo) throw new Error(`Category SEO missing for ${category.slug}`);
      const document = await CategoryModel.findOneAndUpdate(
        { slug: category.slug },
        {
          $set: {
            name: categorySeo.name,
            description: categorySeo.description,
            cloudinaryFolder: category.folder,
            displayOrder: category.displayOrder,
            isActive: true,
          },
        },
        { returnDocument: 'after', upsert: true, runValidators: true, session },
      ).exec();
      categoryIds.set(category.slug, document._id);
    }

    const productOperations = products.map((product) => {
      const categoryId = categoryIds.get(product.category.slug);
      if (!categoryId) throw new Error(`Category ID missing for ${product.category.slug}`);
      const categorySeo = categorySeoBySlug[product.category.slug];
      if (!categorySeo) throw new Error(`Category SEO missing for ${product.category.slug}`);
      const modelGroup = productModelGroup(product.sku);
      return {
        updateOne: {
          filter: { sku: product.sku },
          update: {
            $set: {
              name: product.name,
              sku: product.sku,
              slug: product.slug,
              category: categoryId,
              displayOrder: product.displayOrder,
              inStock: true,
              isActive: true,
              images: [product.image],
              description: productSeoDescription(product.name, categorySeo.description),
              searchTerms: productSearchTerms(
                product.name,
                product.sku,
                categorySeo.name,
                categorySeo.searchTerms,
              ),
              seoManaged: true,
              ...(modelGroup ? { modelGroup } : {}),
            },
            $unset: { material: '' as const },
          },
          upsert: true as const,
        },
      };
    });
    await ProductModel.bulkWrite(productOperations, { ordered: false, session });

    const retainedProducts = await ProductModel.find({
      sku: { $in: products.map(({ sku }) => sku) },
    })
      .select('_id')
      .session(session)
      .lean()
      .exec();
    if (retainedProducts.length !== products.length) {
      throw new Error(`Database verification failed: expected ${products.length} products`);
    }
    await ProductModel.deleteMany({
      _id: { $nin: retainedProducts.map((product) => product._id) },
    })
      .session(session)
      .exec();
    await CategoryModel.deleteMany({
      _id: { $nin: [...categoryIds.values()] },
    })
      .session(session)
      .exec();
  });
}

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function deleteOldCloudinaryAssets(publicIds: string[]): Promise<void> {
  for (const [index, batch] of chunks(publicIds, 100).entries()) {
    await withRetry(`Delete batch ${index + 1}`, () =>
      cloudinary.api.delete_resources(batch, {
        resource_type: 'image',
        type: 'upload',
        invalidate: true,
      }),
    );
    console.log(
      `Deleted ${Math.min((index + 1) * 100, publicIds.length)}/${publicIds.length} old assets`,
    );
  }

  const folders = [
    ...new Set(
      publicIds
        .filter((publicId) => publicId.startsWith(`${cloudinaryRoot}/`))
        .map((publicId) => publicId.split('/').slice(0, -1).join('/')),
    ),
  ].sort((left, right) => right.length - left.length);
  for (const folder of folders) {
    try {
      await cloudinary.api.delete_folder(folder);
    } catch {
      // A non-empty folder is expected when it is shared with the new catalogue.
    }
  }
}

async function verifyFinalState(expectedProducts: number): Promise<void> {
  const [databaseProducts, databaseCategories, cloudinaryResources] = await Promise.all([
    ProductModel.countDocuments({ isActive: true }).exec(),
    CategoryModel.find({ isActive: true }).sort({ displayOrder: 1 }).select('name').lean().exec(),
    listExistingCatalogueResources(),
  ]);
  const finalProductAssets = cloudinaryResources.filter((resource) =>
    resource.public_id.startsWith(`${cloudinaryRoot}/`),
  );
  const directLegacyAssets = cloudinaryResources.filter(
    (resource) => resource.public_id.split('/').length === 2,
  );
  if (
    databaseProducts !== expectedProducts ||
    finalProductAssets.length !== expectedProducts ||
    directLegacyAssets.length !== 0 ||
    databaseCategories.length !== categoryDefinitions.length
  ) {
    throw new Error(
      `Final verification failed (DB products ${databaseProducts}, Cloudinary products ${finalProductAssets.length}, legacy assets ${directLegacyAssets.length}, categories ${databaseCategories.length})`,
    );
  }
  console.log(
    JSON.stringify(
      {
        products: databaseProducts,
        cloudinaryAssets: finalProductAssets.length,
        categories: databaseCategories.map((category) => category.name),
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const sourceRoot = path.resolve(argumentValue('--source') ?? '');
  if (!argumentValue('--source')) {
    throw new Error('Provide the catalogue folder with --source <absolute-path>');
  }
  const manifest = await buildManifest(sourceRoot);
  const totalBytes = manifest.reduce((sum, product) => sum + product.sourceBytes, 0);
  const summary = categoryDefinitions.map((category) => ({
    order: category.displayOrder,
    category: category.name,
    cloudinaryFolder: `${cloudinaryRoot}/${category.folder}`,
    products: manifest.filter((product) => product.category.folder === category.folder).length,
  }));
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        sourceRoot,
        products: manifest.length,
        sourceGiB: Number((totalBytes / 1024 ** 3).toFixed(3)),
        summary,
      },
      null,
      2,
    ),
  );
  if (!apply) {
    console.log('Preflight passed. Re-run with --apply to upload and replace the catalogue.');
    return;
  }
  if (!isCloudinaryConfigured) throw new Error('Cloudinary credentials are required');

  const previousResources = await listExistingCatalogueResources();
  const resourcesByPublicId = new Map(
    previousResources.map((resource) => [resource.public_id, resource]),
  );
  console.log(
    `Uploading and verifying ${manifest.length} originals with no upload transformation...`,
  );
  let completedUploads = 0;
  let reusedUploads = 0;
  const uploaded = await mapWithConcurrency(manifest, uploadConcurrency, async (product) => {
    const existing = useVerifiedExistingAsset(product, resourcesByPublicId.get(product.publicId));
    const result = existing ?? (await uploadProduct(product));
    if (existing) reusedUploads += 1;
    completedUploads += 1;
    if (completedUploads % 20 === 0 || completedUploads === manifest.length) {
      console.log(`Uploaded ${completedUploads}/${manifest.length}`);
    }
    return result;
  });
  console.log(
    `Verified ${uploaded.length} originals (${reusedUploads} already uploaded, ${uploaded.length - reusedUploads} uploaded now)`,
  );

  await connectDatabase();
  const backupPath = await writeDatabaseBackup();
  console.log(`Database backup written to ${backupPath}`);
  await replaceDatabaseCatalog(uploaded);
  console.log('Database catalogue switched successfully');

  const newPublicIds = new Set(uploaded.map((product) => product.publicId));
  const oldPublicIds = previousResources
    .map((resource) => resource.public_id)
    .filter((publicId) => !newPublicIds.has(publicId));
  await deleteOldCloudinaryAssets(oldPublicIds);
  await verifyFinalState(manifest.length);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
