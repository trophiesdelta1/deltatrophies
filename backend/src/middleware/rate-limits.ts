import { rateLimit, type Options } from 'express-rate-limit';
import { env } from '../config/env.js';

const commonOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response, _next, options): void => {
    response.status(options.statusCode).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: typeof options.message === 'string' ? options.message : 'Too many requests',
    });
  },
} satisfies Partial<Options>;

export const apiRateLimit = rateLimit({
  ...commonOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  message: 'Too many requests. Please try again later.',
});

export const loginRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts. Please try again later.',
});

export const submissionRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many submissions. Please try again later.',
});
