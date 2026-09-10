import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { noStore } from '../middleware/no-store.js';
import { loginRateLimit } from '../middleware/rate-limits.js';
import { validateRequest } from '../middleware/validate-request.js';
import { loginRequestSchema } from '../validation/auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', noStore, loginRateLimit, validateRequest(loginRequestSchema), login);
