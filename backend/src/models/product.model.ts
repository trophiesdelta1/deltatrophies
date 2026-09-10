import { model, Schema, type Types } from 'mongoose';

export interface ProductImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface Product {
  _id: Types.ObjectId;
  name: string;
  sku?: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  material?: string;
  modelGroup?: 'LA' | 'F' | 'RA' | 'ACA';
  searchTerms: string[];
  seoManaged: boolean;
  displayOrder: number;
  inStock: boolean;
  images: ProductImage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    sku: { type: String, unique: true, sparse: true, trim: true, uppercase: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 280,
    },
    description: { type: String, trim: true, maxlength: 5_000 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    material: { type: String, trim: true, maxlength: 120 },
    modelGroup: {
      type: String,
      enum: ['LA', 'F', 'RA', 'ACA'],
      trim: true,
      uppercase: true,
      index: true,
    },
    searchTerms: {
      type: [{ type: String, trim: true, maxlength: 80 }],
      default: [],
    },
    seoManaged: { type: Boolean, required: true, default: false },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    inStock: { type: Boolean, required: true, default: true, index: true },
    images: { type: [imageSchema], required: true, default: [] },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'products',
  },
);

productSchema.index({
  name: 'text',
  sku: 'text',
  description: 'text',
  material: 'text',
  searchTerms: 'text',
});
productSchema.index({ category: 1, isActive: 1, displayOrder: 1 });
productSchema.index({ isActive: 1, displayOrder: 1 });

export const ProductModel = model<Product>('Product', productSchema);
