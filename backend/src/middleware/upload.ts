import multer from 'multer';
import { MAX_IMAGE_SIZE_BYTES, MAX_PRODUCT_IMAGES } from '../config/constants.js';
import { ApiError } from '../utils/api-error.js';

const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_PRODUCT_IMAGES,
    fileSize: MAX_IMAGE_SIZE_BYTES,
    fields: 20,
    fieldSize: 32 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(422, 'INVALID_IMAGE_TYPE', 'Only JPEG, PNG, WebP, and GIF are allowed'),
      );
      return;
    }
    callback(null, true);
  },
});
