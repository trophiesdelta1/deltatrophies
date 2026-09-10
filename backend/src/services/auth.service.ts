import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_AUDIENCE, JWT_ISSUER } from '../config/constants.js';
import { AdminModel } from '../models/admin.model.js';
import { ApiError } from '../utils/api-error.js';

const dummyPasswordHash = '$2b$12$9O6P8VtrzQKveN2bpj2LzuB/YW9qGLr2AzsXBFLspQaTZKvHmDn0S';
const maximumFailedAttempts = 5;
const lockDurationMs = 15 * 60 * 1000;

export interface LoginResult {
  token: string;
  admin: { id: string; username: string; role: string };
}

export async function authenticateAdmin(username: string, password: string): Promise<LoginResult> {
  const admin = await AdminModel.findOne({ username })
    .select('+passwordHash +failedLoginAttempts +lockedUntil')
    .exec();

  const validPassword = await bcrypt.compare(password, admin?.passwordHash ?? dummyPasswordHash);

  if (!admin?.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  if (admin.lockedUntil?.getTime() && admin.lockedUntil.getTime() > Date.now()) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', 'Account is temporarily locked');
  }

  if (!validPassword) {
    const failedLoginAttempts = admin.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= maximumFailedAttempts;
    await AdminModel.updateOne(
      { _id: admin._id },
      {
        $set: {
          failedLoginAttempts: shouldLock ? 0 : failedLoginAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + lockDurationMs) : null,
        },
      },
    ).exec();
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  await AdminModel.updateOne(
    { _id: admin._id },
    { $set: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } },
  ).exec();

  const options: SignOptions = {
    algorithm: 'HS256',
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    expiresIn: env.AUTH_JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  };
  const token = jwt.sign({ username: admin.username, role: admin.role }, env.AUTH_JWT_SECRET, {
    ...options,
    subject: admin._id.toString(),
  });

  return {
    token,
    admin: { id: admin._id.toString(), username: admin.username, role: admin.role },
  };
}
