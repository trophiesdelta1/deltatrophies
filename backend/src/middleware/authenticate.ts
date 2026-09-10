import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_AUDIENCE, JWT_ISSUER } from '../config/constants.js';
import { AdminModel } from '../models/admin.model.js';
import { ApiError } from '../utils/api-error.js';

interface AdminTokenPayload extends JwtPayload {
  username: string;
  role: 'admin' | 'super-admin';
}

export const authenticate: RequestHandler = (request, response, next): void => {
  const [scheme, token] = (request.get('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required'));
    return;
  }

  void (async () => {
    try {
      const payload = jwt.verify(token, env.AUTH_JWT_SECRET, {
        algorithms: ['HS256'],
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
      }) as AdminTokenPayload;

      if (!payload.sub) {
        throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token');
      }

      const activeAdmin = await AdminModel.exists({ _id: payload.sub, isActive: true });
      if (!activeAdmin) {
        throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token');
      }

      response.locals.admin = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      };
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }
      next(new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
    }
  })();
};
