import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { AdminModel } from '../src/models/admin.model.js';

const inputSchema = z.object({
  ADMIN_USERNAME: z.string().trim().min(3).max(100).toLowerCase(),
  ADMIN_PASSWORD: z.string().min(12).max(200),
});

async function main(): Promise<void> {
  const input = inputSchema.parse(process.env);
  await connectDatabase();
  const passwordHash = await bcrypt.hash(input.ADMIN_PASSWORD, 12);
  await AdminModel.updateOne(
    { username: input.ADMIN_USERNAME },
    {
      $set: {
        passwordHash,
        role: 'super-admin',
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    },
    { upsert: true, runValidators: true },
  ).exec();
  logger.info({ username: input.ADMIN_USERNAME }, 'Admin account created or rotated');
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'Admin provisioning failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
