import { Document, Types } from 'mongoose';

export function toDomain<T extends Document>(
  doc: T | null | undefined,
): (Omit<T, '_id'> & { id: string }) | undefined {
  if (!doc) return undefined;

  return {
    ...doc.toObject<T>(),
    id: doc._id.toString(),
  };
}

export function toDomainLean<T extends { _id: Types.ObjectId }>(
  lean: T | null | undefined,
): (Omit<T, '_id'> & { id: string }) | undefined {
  if (!lean) return undefined;

  return {
    ...lean,
    id: lean._id.toString(),
  };
}
