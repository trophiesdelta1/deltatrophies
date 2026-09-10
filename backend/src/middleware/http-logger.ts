import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger.js';

export const httpLogger = pinoHttp({
  logger,
  genReqId(request, response) {
    const incomingId = request.headers['x-request-id'];
    const requestId =
      typeof incomingId === 'string' && incomingId.length <= 100 ? incomingId : randomUUID();
    response.setHeader('x-request-id', requestId);
    return requestId;
  },
  customSuccessMessage(request, response) {
    return `${request.method} ${request.url} completed with ${response.statusCode}`;
  },
  customErrorMessage(request, response) {
    return `${request.method} ${request.url} failed with ${response.statusCode}`;
  },
});
