import { z } from 'zod';
import {
  emptyObjectSchema,
  formBooleanSchema,
  objectIdSchema,
  optionalText,
} from './shared.schemas.js';

export const productListRequestSchema = z.object({
  body: emptyObjectSchema,
  params: emptyObjectSchema,
  query: z.object({
    category: optionalText(120),
    search: optionalText(120),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(1_000).default(1_000),
    in_stock: z.preprocess(
      (value) => (value === undefined ? undefined : value),
      formBooleanSchema.optional(),
    ),
  }),
});

export const productIdRequestSchema = z.object({
  body: emptyObjectSchema,
  query: emptyObjectSchema,
  params: z.object({ id: objectIdSchema }),
});

export const createProductRequestSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(255),
    sku: optionalText(100),
    description: optionalText(5_000),
    category_id: objectIdSchema,
    model_group: z.enum(['LA', 'F', 'RA', 'ACA']).optional(),
    material: optionalText(120),
    in_stock: formBooleanSchema.default(true),
  }),
  query: emptyObjectSchema,
  params: emptyObjectSchema,
});

export const updateProductRequestSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(255).optional(),
      sku: optionalText(100),
      description: optionalText(5_000),
      category_id: objectIdSchema.optional(),
      model_group: z.enum(['LA', 'F', 'RA', 'ACA']).optional(),
      material: optionalText(120),
      in_stock: formBooleanSchema.optional(),
      is_active: formBooleanSchema.optional(),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one field is required',
    }),
  query: emptyObjectSchema,
  params: z.object({ id: objectIdSchema }),
});

export type ProductListRequest = z.infer<typeof productListRequestSchema>;
export type ProductIdRequest = z.infer<typeof productIdRequestSchema>;
export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;
