import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === mongoose.STATES.connected) return;

  await mongoose.connect(env.MONGODB_URI, {
    appName: 'delta-trophies-api',
    autoIndex: env.NODE_ENV !== 'production',
    maxPoolSize: env.DB_MAX_POOL_SIZE,
    minPoolSize: env.DB_MIN_POOL_SIZE,
    serverSelectionTimeoutMS: env.DB_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: 45_000,
    maxIdleTimeMS: 60_000,
    retryWrites: true,
  });

  logger.info({ database: mongoose.connection.name }, 'MongoDB connection established');
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== mongoose.STATES.disconnected) {
    await mongoose.disconnect();
  }
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === mongoose.STATES.connected;
}

mongoose.connection.on('error', (error) => {
  logger.error({ err: error }, 'MongoDB connection error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
