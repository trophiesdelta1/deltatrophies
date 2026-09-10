import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { productImageUpload } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validate-request.js';
import {
  createProductRequestSchema,
  productIdRequestSchema,
  productListRequestSchema,
  updateProductRequestSchema,
} from '../validation/product.schemas.js';

export const productRouter = Router();

productRouter.get('/', validateRequest(productListRequestSchema), getProducts);
productRouter.get('/:id', validateRequest(productIdRequestSchema), getProductById);
productRouter.post(
  '/',
  authenticate,
  productImageUpload.array('images'),
  validateRequest(createProductRequestSchema),
  createProduct,
);
productRouter.patch(
  '/:id',
  authenticate,
  validateRequest(updateProductRequestSchema),
  updateProduct,
);
productRouter.put('/:id', authenticate, validateRequest(updateProductRequestSchema), updateProduct);
productRouter.delete('/:id', authenticate, validateRequest(productIdRequestSchema), deleteProduct);
