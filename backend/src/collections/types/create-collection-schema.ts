import * as z from 'zod/v4';
import { LocalizedStringSchema, collectionTypes } from 'src/lib/types/project';

export const CreateCollectionRequestSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  type: z.enum(collectionTypes),
});

export type CreateCollectionRequest = z.infer<
  typeof CreateCollectionRequestSchema
>;
