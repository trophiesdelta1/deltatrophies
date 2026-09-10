import { createServer } from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = createApp();
const server = createServer(app);
let shuttingDown = false;

function shutdown(signal: string, exitCode = 0): void {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');

  const forceExitTimer = setTimeout(() => {
    logger.fatal('Graceful shutdown timed out');
    process.exit(1);
  }, 15_000);
  forceExitTimer.unref();

  server.close(async (error) => {
    if (error) logger.error({ err: error }, 'HTTP server close failed');
    try {
      await disconnectDatabase();
    } catch (databaseError) {
      logger.error({ err: databaseError }, 'Database disconnect failed');
      exitCode = 1;
    } finally {
      clearTimeout(forceExitTimer);
      process.exit(error ? 1 : exitCode);
    }
  });
}

async function start(): Promise<void> {
  await connectDatabase();
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'API listening');
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => {
  logger.fatal({ err: error }, 'Unhandled promise rejection');
  shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('uncaughtException', 1);
});

start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'API startup failed');
  process.exit(1);
});
