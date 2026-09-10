import { model, Schema, type Types } from 'mongoose';

export interface Admin {
  _id: Types.ObjectId;
  username: string;
  passwordHash: string;
  role: 'admin' | 'super-admin';
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<Admin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['admin', 'super-admin'], default: 'admin' },
    isActive: { type: Boolean, required: true, default: true, index: true },
    failedLoginAttempts: { type: Number, required: true, min: 0, default: 0, select: false },
    lockedUntil: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'admins',
  },
);

export const AdminModel = model<Admin>('Admin', adminSchema);
