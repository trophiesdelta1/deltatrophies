import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid resource id');

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^[+()\-\s\d]+$/, 'Invalid phone number');

export function optionalText(maximumLength: number): z.ZodType<string | undefined> {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(maximumLength).optional(),
  );
}

export const formBooleanSchema = z.preprocess((value) => {
  if (value === 'true' || value === '1' || value === true) return true;
  if (value === 'false' || value === '0' || value === false) return false;
  return value;
}, z.boolean());

export const emptyObjectSchema = z.preprocess((value) => value ?? {}, z.object({}).passthrough());
