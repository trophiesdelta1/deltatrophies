import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError, type ErrorDetails } from '../utils/api-error.js';

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  details?: ErrorDetails;
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    };
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 5 MB or smaller'
        : 'Invalid image upload';
    return { statusCode: 422, code: 'UPLOAD_ERROR', message };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const fields = Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));
    return {
      statusCode: 422,
      code: 'DATABASE_VALIDATION_ERROR',
      message: 'Data validation failed',
      details: { fields },
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 422, code: 'INVALID_ID', message: 'Invalid resource id' };
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11_000) {
    return {
      statusCode: 409,
      code: 'DUPLICATE_RESOURCE',
      message: 'A record with the same unique value already exists',
    };
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    return { statusCode: 400, code: 'INVALID_JSON', message: 'Invalid JSON payload' };
  }

  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' };
}

export const notFound: RequestHandler = (request, _response, next): void => {
  next(new ApiError(404, 'ROUTE_NOT_FOUND', `Route not found: ${request.method} ${request.path}`));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next): void => {
  const normalized = normalizeError(error);
  const requestId = response.getHeader('x-request-id');

  if (normalized.statusCode >= 500) {
    logger.error(
      { err: error, requestId, method: request.method, path: request.path },
      'Request failed',
    );
  }

  response.status(normalized.statusCode).json({
    success: false,
    code: normalized.code,
    error: normalized.message,
    ...(normalized.details ? { details: normalized.details } : {}),
    ...(requestId ? { requestId } : {}),
    ...(env.NODE_ENV === 'development' && error instanceof Error ? { debug: error.message } : {}),
  });
};
