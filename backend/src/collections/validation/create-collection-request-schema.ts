import * as z from 'zod/v4';
import { collectionTypes } from 'src/lib/project';
import { LocalizedStringSchema } from 'src/lib/validation/localization';

export const CreateCollectionRequestSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  type: z.enum(collectionTypes),
  genres: z.array(z.string()).optional(),
});

export type CreateCollectionRequest = z.infer<
  typeof CreateCollectionRequestSchema
>;
