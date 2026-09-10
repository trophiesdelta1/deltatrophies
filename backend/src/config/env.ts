import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
export const backendRoot = path.resolve(moduleDirectory, '../..');

dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
    MONGODB_URI: z
      .string()
      .min(1)
      .refine((value) => /^mongodb(\+srv)?:\/\//.test(value), {
        message: 'must be a valid MongoDB connection string',
      }),
    AUTH_JWT_SECRET: z.string().min(32),
    AUTH_JWT_EXPIRES_IN: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('8h'),
    APP_ORIGINS: z.string().min(1).default('http://localhost:5173'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DB_MAX_POOL_SIZE: z.coerce.number().int().min(2).max(100).default(20),
    DB_MIN_POOL_SIZE: z.coerce.number().int().min(0).max(20).default(2),
    DB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
    RATE_LIMIT_MAX: z.coerce.number().int().min(10).max(10_000).default(300),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(60_000).default(900_000),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.DB_MIN_POOL_SIZE > values.DB_MAX_POOL_SIZE) {
      context.addIssue({
        code: 'custom',
        path: ['DB_MIN_POOL_SIZE'],
        message: 'must be less than or equal to DB_MAX_POOL_SIZE',
      });
    }

    const cloudinaryValues = [
      values.CLOUDINARY_CLOUD_NAME,
      values.CLOUDINARY_API_KEY,
      values.CLOUDINARY_API_SECRET,
    ];
    const configuredCount = cloudinaryValues.filter(Boolean).length;
    if (configuredCount > 0 && configuredCount < cloudinaryValues.length) {
      context.addIssue({
        code: 'custom',
        path: ['CLOUDINARY_CLOUD_NAME'],
        message: 'all Cloudinary variables must be configured together',
      });
    }
    if (values.NODE_ENV === 'production' && configuredCount !== cloudinaryValues.length) {
      context.addIssue({
        code: 'custom',
        path: ['CLOUDINARY_CLOUD_NAME'],
        message: 'Cloudinary is required in production',
      });
    }
  });

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const reasons = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${reasons}`);
}

export const env = Object.freeze(parsedEnvironment.data);

export const allowedOrigins = Object.freeze(
  env.APP_ORIGINS.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
);

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
