import { z } from 'zod';
import { emptyObjectSchema, formBooleanSchema, objectIdSchema } from './shared.schemas.js';

export const categoryListRequestSchema = z.object({
  body: emptyObjectSchema,
  query: emptyObjectSchema,
  params: emptyObjectSchema,
});

export const createCategoryRequestSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    display_order: z.coerce.number().int().min(0).default(0),
  }),
  query: emptyObjectSchema,
  params: emptyObjectSchema,
});

export const updateCategoryRequestSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2)
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
      display_order: z.coerce.number().int().min(0).optional(),
      is_active: formBooleanSchema.optional(),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one field is required',
    }),
  query: emptyObjectSchema,
  params: z.object({ id: objectIdSchema }),
});

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;
