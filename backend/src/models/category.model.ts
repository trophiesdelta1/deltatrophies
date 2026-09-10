import { model, Schema, type Types } from 'mongoose';

export interface Category {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  cloudinaryFolder?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    cloudinaryFolder: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 500 },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'categories',
  },
);

categorySchema.index({ displayOrder: 1, name: 1 });

export const CategoryModel = model<Category>('Category', categorySchema);
