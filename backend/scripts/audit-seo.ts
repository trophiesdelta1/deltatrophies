import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { CategoryModel } from '../src/models/category.model.js';
import { ProductModel } from '../src/models/product.model.js';
import { buildProductSeoDescription, buildProductSeoTitle } from '../src/utils/seo.js';

interface AuditIssue {
  id: string;
  field: string;
  message: string;
}

function duplicateValues(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

async function main(): Promise<void> {
  await connectDatabase();
  const [products, categories] = await Promise.all([
    ProductModel.find({ isActive: true }).lean().exec(),
    CategoryModel.find({ isActive: true }).lean().exec(),
  ]);
  const categoryById = new Map(categories.map((category) => [category._id.toString(), category]));
  const errors: AuditIssue[] = [];
  const warnings: AuditIssue[] = [];

  for (const duplicate of duplicateValues(products.map((product) => product.name.toLowerCase()))) {
    errors.push({
      id: duplicate,
      field: 'name',
      message: 'Duplicate customer-facing product name',
    });
  }
  for (const duplicate of duplicateValues(products.map((product) => product.slug))) {
    errors.push({ id: duplicate, field: 'slug', message: 'Duplicate product slug' });
  }

  for (const product of products) {
    const id = product._id.toString();
    const category = categoryById.get(product.category.toString());
    const name = product.name.trim();
    const normalizedTerms = product.searchTerms.map((term) => term.toLowerCase());
    const seoDescription = buildProductSeoDescription(name);
    const seoTitle = buildProductSeoTitle(name);

    if (!category) errors.push({ id, field: 'category', message: 'Active category is missing' });
    if (!name || name.toLowerCase() === product.sku?.toLowerCase()) {
      errors.push({ id, field: 'name', message: 'Customer-facing name is empty or only the SKU' });
    }
    if (/\bdesign\s*[-#]?\s*\d+\b/i.test(name)) {
      errors.push({ id, field: 'name', message: 'Name contains a Design number placeholder' });
    }
    if (!/-[a-f\d]{8}$/i.test(product.slug)) {
      errors.push({ id, field: 'slug', message: 'Slug has no stable identity suffix' });
    }
    if (!product.description?.trim()) {
      errors.push({ id, field: 'description', message: 'Product description is missing' });
    }
    if (product.images.length === 0) {
      errors.push({ id, field: 'images', message: 'Product has no image' });
    }
    if (product.images.some((image) => !image.url.startsWith('https://'))) {
      errors.push({ id, field: 'images', message: 'Product contains a non-HTTPS image URL' });
    }
    if (!normalizedTerms.includes(name.toLowerCase())) {
      errors.push({ id, field: 'searchTerms', message: 'Current product name is not searchable' });
    }
    if (product.sku && !normalizedTerms.includes(product.sku.toLowerCase())) {
      errors.push({ id, field: 'searchTerms', message: 'Current SKU is not searchable' });
    }
    if (category?.slug === 'la-aca-ra-f-models' && !product.modelGroup) {
      errors.push({ id, field: 'modelGroup', message: 'Special award subcategory is missing' });
    }
    if (seoDescription.length > 160) {
      warnings.push({
        id,
        field: 'seo_description',
        message: 'Generated description exceeds 160 characters',
      });
    }
    if (seoTitle.length > 65) {
      warnings.push({ id, field: 'seo_title', message: 'Generated title exceeds 65 characters' });
    }
  }

  for (const category of categories) {
    if (!category.description?.trim()) {
      errors.push({
        id: category._id.toString(),
        field: 'category.description',
        message: `${category.name} has no SEO introduction`,
      });
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    activeProducts: products.length,
    activeCategories: categories.length,
    uniqueNames: new Set(products.map((product) => product.name.toLowerCase())).size,
    uniqueSlugs: new Set(products.map((product) => product.slug)).size,
    errors,
    warnings,
  };
  console.log(JSON.stringify(report, null, 2));
  if (errors.length > 0) process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'SEO audit failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
