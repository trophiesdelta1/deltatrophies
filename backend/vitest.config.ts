import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/delta_trophies_test',
      AUTH_JWT_SECRET: 'test-only-secret-that-is-longer-than-thirty-two-characters',
      APP_ORIGINS: 'http://localhost:5173',
      LOG_LEVEL: 'silent',
    },
  },
});
