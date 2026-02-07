import * as z from 'zod/v4';
import { collectionTypes } from 'src/lib/project';
import { LocalizedStringSchema } from 'src/lib/validation/localization';

export const CreateCollectionSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  type: z.enum(collectionTypes),
});

export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
