import type { RequestHandler } from 'express';

export const noStore: RequestHandler = (_request, response, next): void => {
  response.setHeader('Cache-Control', 'no-store');
  next();
};
