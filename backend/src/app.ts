import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { isDatabaseReady } from './config/database.js';
import { allowedOrigins, env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { httpLogger } from './middleware/http-logger.js';
import { apiRateLimit } from './middleware/rate-limits.js';
import { apiRouter } from './routes/index.js';
import { ApiError } from './utils/api-error.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);
  app.use(httpLogger);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(
    cors({
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
          callback(null, true);
          return;
        }
        callback(new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed'));
      },
    }),
  );
  app.use(express.json({ limit: '100kb', strict: true }));
  app.use(express.urlencoded({ extended: false, limit: '100kb', parameterLimit: 100 }));

  app.get('/', (_request, response) => {
    response.status(200).json({ success: true, service: 'Delta Trophies API', version: '2.0.0' });
  });
  app.get('/api/v1/health/live', (_request, response) => {
    response.status(200).json({ success: true, status: 'alive' });
  });
  app.get('/api/v1/health/ready', (_request, response) => {
    const ready = isDatabaseReady();
    response.status(ready ? 200 : 503).json({
      success: ready,
      status: ready ? 'ready' : 'not_ready',
    });
  });

  app.use('/api/v1', apiRateLimit, apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
