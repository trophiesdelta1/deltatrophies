import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { backendRoot } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { CategoryModel } from '../src/models/category.model.js';
import { ProductModel } from '../src/models/product.model.js';
import { updateSlug } from '../src/utils/slug.js';
import {
  categorySeoBySlug,
  curatedProductName,
  productModelGroup,
  productSearchTerms,
  productSeoDescription,
} from './catalog-seo-data.js';

const expectedProductCount = 625;

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function run(): Promise<void> {
  await connectDatabase();
  const apply = hasFlag('--apply');
  const [categories, products] = await Promise.all([
    CategoryModel.find({ isActive: true }).sort({ displayOrder: 1 }).lean().exec(),
    ProductModel.find({ isActive: true }).sort({ displayOrder: 1, _id: 1 }).lean().exec(),
  ]);

  if (products.length !== expectedProductCount) {
    throw new Error(`Expected ${expectedProductCount} active products, found ${products.length}`);
  }

  const categoriesById = new Map(categories.map((category) => [category._id.toString(), category]));
  const planned = products.map((product) => {
    const category = categoriesById.get(product.category.toString());
    if (!category) throw new Error(`Missing category for product ${product._id.toString()}`);
    if (!product.sku) throw new Error(`Missing SKU for product ${product._id.toString()}`);
    const categorySeo = categorySeoBySlug[category.slug];
    if (!categorySeo) throw new Error(`Missing category SEO definition for ${category.slug}`);
    const name = curatedProductName(product.sku, category.slug);
    const searchTerms = productSearchTerms(
      name,
      product.sku,
      categorySeo.name,
      categorySeo.searchTerms,
    );
    const modelGroup = productModelGroup(product.sku);
    return {
      id: product._id,
      sku: product.sku,
      name,
      slug: updateSlug(product.slug, name, product.sku),
      description: productSeoDescription(name, categorySeo.description),
      searchTerms,
      ...(category.slug === 'la-aca-ra-f-models' && modelGroup ? { modelGroup } : {}),
    };
  });

  const uniqueNames = new Set(planned.map((product) => product.name.toLowerCase()));
  const uniqueSlugs = new Set(planned.map((product) => product.slug));
  if (uniqueNames.size !== planned.length) {
    throw new Error(`Product names are not unique (${uniqueNames.size}/${planned.length})`);
  }
  if (uniqueSlugs.size !== planned.length) {
    throw new Error(`Product slugs are not unique (${uniqueSlugs.size}/${planned.length})`);
  }

  if (!apply) {
    process.stdout.write(
      `${JSON.stringify({ mode: 'dry-run', products: planned.length, categories: categories.length, uniqueNames: uniqueNames.size, uniqueSlugs: uniqueSlugs.size }, null, 2)}\n`,
    );
    return;
  }

  const backupDirectory = path.join(backendRoot, '.catalog-backups');
  await mkdir(backupDirectory, { recursive: true });
  const backupPath = path.join(
    backupDirectory,
    `catalog-before-seo-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  await writeFile(
    backupPath,
    `${JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        categories: categories.map(({ _id, name, slug, description }) => ({
          id: _id.toString(),
          name,
          slug,
          description: description ?? null,
        })),
        products: products.map(({ _id, name, sku, slug, description, searchTerms }) => ({
          id: _id.toString(),
          name,
          sku: sku ?? null,
          slug,
          description: description ?? null,
          searchTerms: searchTerms ?? [],
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await CategoryModel.bulkWrite(
        categories.map((category) => {
          const seo = categorySeoBySlug[category.slug];
          if (!seo) throw new Error(`Missing category SEO definition for ${category.slug}`);
          return {
            updateOne: {
              filter: { _id: category._id },
              update: { $set: { name: seo.name, description: seo.description } },
            },
          };
        }),
        { ordered: true, session },
      );
      await ProductModel.bulkWrite(
        planned.map((product) => ({
          updateOne: {
            filter: { _id: product.id, sku: product.sku, isActive: true },
            update: {
              $set: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                searchTerms: product.searchTerms,
                seoManaged: true,
                ...(product.modelGroup ? { modelGroup: product.modelGroup } : {}),
              },
            },
          },
        })),
        { ordered: true, session },
      );
    });
  } finally {
    await session.endSession();
  }

  const [updatedProducts, updatedCategories] = await Promise.all([
    ProductModel.countDocuments({ isActive: true, seoManaged: true }).exec(),
    CategoryModel.countDocuments({
      isActive: true,
      description: { $exists: true, $ne: '' },
    }).exec(),
  ]);
  if (updatedProducts !== expectedProductCount || updatedCategories !== categories.length) {
    throw new Error(
      `SEO verification failed: ${updatedProducts} products, ${updatedCategories} categories`,
    );
  }
  process.stdout.write(
    `${JSON.stringify({ mode: 'applied', products: updatedProducts, categories: updatedCategories, uniqueNames: uniqueNames.size, backup: path.basename(backupPath) }, null, 2)}\n`,
  );
}

run()
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
