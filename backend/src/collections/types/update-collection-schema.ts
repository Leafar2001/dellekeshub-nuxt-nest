import * as z from 'zod/v4';
import { LocalizedStringSchema, collectionTypes } from 'src/lib/types/project';

export const UpdateCollectionRequestSchema = z.object({
  title: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  type: z.enum(collectionTypes).optional(),
});

export type UpdateCollectionRequest = z.infer<
  typeof UpdateCollectionRequestSchema
>;
