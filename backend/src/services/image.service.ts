import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import type { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import { isCloudinaryConfigured } from '../config/env.js';
import type { ProductImage } from '../models/product.model.js';
import { ApiError } from '../utils/api-error.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function toUploadError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new Error(error.message);
  }
  return new Error('Cloudinary image upload failed');
}

function uploadBuffer(file: Express.Multer.File, categoryFolder: string): Promise<ProductImage> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: `deltatrophies/products/${categoryFolder}`,
        public_id: randomUUID(),
        resource_type: 'image',
        overwrite: false,
      },
      (error, result?: UploadApiResponse) => {
        if (error) {
          reject(toUploadError(error));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary returned an empty upload result'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );

    upload.end(file.buffer);
  });
}

async function validateImage(file: Express.Multer.File): Promise<void> {
  const detectedType = await fileTypeFromBuffer(file.buffer);
  if (!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
    throw new ApiError(422, 'INVALID_IMAGE', 'Uploaded file is not a supported image');
  }
}

export async function uploadProductImages(
  files: Express.Multer.File[] = [],
  categoryFolder = 'uncategorized',
): Promise<ProductImage[]> {
  if (files.length === 0) return [];
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'MEDIA_STORAGE_UNAVAILABLE', 'Image storage is not configured');
  }

  await Promise.all(files.map(validateImage));
  const uploaded: ProductImage[] = [];

  try {
    for (const file of files) uploaded.push(await uploadBuffer(file, categoryFolder));
    return uploaded;
  } catch (error) {
    await deleteProductImages(uploaded);
    throw error;
  }
}

interface DeleteProductImagesOptions {
  strict?: boolean;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function destroyImage(publicId: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = (await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      })) as { result?: string };
      if (result.result === 'ok' || result.result === 'not found') return;
      throw new Error(`Unexpected Cloudinary deletion result: ${result.result ?? 'empty'}`);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await wait(attempt * 500);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Cloudinary image deletion failed');
}

export async function deleteProductImages(
  images: ProductImage[],
  options: DeleteProductImagesOptions = {},
): Promise<void> {
  if (!isCloudinaryConfigured) return;
  const publicIds = images
    .map((image) => image.publicId)
    .filter((publicId): publicId is string => Boolean(publicId));

  if (options.strict) {
    await Promise.all(publicIds.map(destroyImage));
    return;
  }
  await Promise.allSettled(publicIds.map(destroyImage));
}
