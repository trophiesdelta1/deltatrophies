import type { RequestHandler } from 'express';
import { authenticateAdmin } from '../services/auth.service.js';
import type { LoginRequest } from '../validation/auth.schemas.js';

export const login: RequestHandler = async (_request, response) => {
  const { username, password } = (response.locals.validated as LoginRequest).body;
  const result = await authenticateAdmin(username, password);
  response.status(200).json({ success: true, ...result });
};
