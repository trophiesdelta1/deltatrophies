import { CategoryModel } from '../models/category.model.js';
import { ProductModel } from '../models/product.model.js';
import { ApiError } from '../utils/api-error.js';
import { toObjectId } from '../utils/object-id.js';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../validation/category.schemas.js';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  thumbnail: string | null;
  product_count: number;
}

interface CategoryAggregateRow {
  _id: { toString(): string };
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  thumbnail?: string;
  productCount: number;
}

export async function listCategories(): Promise<CategoryDto[]> {
  const rows = await CategoryModel.aggregate<CategoryAggregateRow>([
    { $match: { isActive: true } },
    { $sort: { displayOrder: 1, name: 1 } },
    {
      $lookup: {
        from: ProductModel.collection.name,
        let: { categoryId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$category', '$$categoryId'] }, isActive: true } },
          { $match: { 'images.0.url': { $exists: true } } },
          { $sort: { displayOrder: 1 } },
          {
            $group: {
              _id: null,
              productCount: { $sum: 1 },
              thumbnail: { $first: { $arrayElemAt: ['$images.url', 0] } },
            },
          },
          { $limit: 1 },
        ],
        as: 'sampleProduct',
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        displayOrder: 1,
        thumbnail: { $arrayElemAt: ['$sampleProduct.thumbnail', 0] },
        productCount: {
          $ifNull: [{ $arrayElemAt: ['$sampleProduct.productCount', 0] }, 0],
        },
      },
    },
  ]).exec();

  return rows.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    display_order: row.displayOrder,
    thumbnail: row.thumbnail ?? null,
    product_count: row.productCount,
  }));
}

export async function createCategory(input: CreateCategoryRequest['body']): Promise<CategoryDto> {
  const category = await CategoryModel.create({
    name: input.name,
    slug: input.slug,
    displayOrder: input.display_order,
  });
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    display_order: category.displayOrder,
    thumbnail: null,
    product_count: 0,
  };
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryRequest['body'],
): Promise<CategoryDto> {
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.slug !== undefined) update.slug = input.slug;
  if (input.display_order !== undefined) update.displayOrder = input.display_order;
  if (input.is_active !== undefined) update.isActive = input.is_active;

  const category = await CategoryModel.findByIdAndUpdate(toObjectId(id), update, {
    new: true,
    runValidators: true,
  }).exec();
  if (!category) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');

  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    display_order: category.displayOrder,
    thumbnail: null,
    product_count: await ProductModel.countDocuments({ category: category._id, isActive: true }),
  };
}
