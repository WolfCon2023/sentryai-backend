import { Document, Types } from 'mongoose';

export function toJSON<T extends Document>(doc: T): Record<string, unknown> {
  const obj = doc.toObject();
  obj.id = (obj._id as Types.ObjectId).toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}
