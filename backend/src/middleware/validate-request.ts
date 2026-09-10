import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/api-error.js';

interface RequestInput {
  body: unknown;
  query: unknown;
  params: unknown;
}

export function validateRequest<T>(schema: ZodType<T>): RequestHandler {
  return (request, response, next): void => {
    const result = schema.safeParse({
      body: request.body,
      query: request.query,
      params: request.params,
    } satisfies RequestInput);

    if (!result.success) {
      const fields = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      next(new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed', { fields }));
      return;
    }

    response.locals.validated = result.data;
    next();
  };
}
