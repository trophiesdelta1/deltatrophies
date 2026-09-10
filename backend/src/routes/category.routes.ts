import { Router } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
} from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate-request.js';
import {
  categoryListRequestSchema,
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
} from '../validation/category.schemas.js';

export const categoryRouter = Router();

categoryRouter.get('/', validateRequest(categoryListRequestSchema), getCategories);
categoryRouter.post(
  '/',
  authenticate,
  validateRequest(createCategoryRequestSchema),
  createCategory,
);
categoryRouter.patch(
  '/:id',
  authenticate,
  validateRequest(updateCategoryRequestSchema),
  updateCategory,
);
