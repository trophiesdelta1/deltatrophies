import { Types } from 'mongoose';

export function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}
