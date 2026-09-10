import { z } from 'zod';
import { emptyObjectSchema } from './shared.schemas.js';

export const loginRequestSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(100).toLowerCase(),
    password: z.string().min(8).max(200),
  }),
  query: emptyObjectSchema,
  params: emptyObjectSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
