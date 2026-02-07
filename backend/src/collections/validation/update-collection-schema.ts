import * as z from 'zod/v4';
import { collectionTypes } from 'src/lib/project';
import { LocalizedStringSchema } from 'src/lib/validation/localization';

export const UpdateCollectionSchema = z.object({
  title: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  type: z.enum(collectionTypes).optional(),
});

export type UpdateCollection = z.infer<typeof UpdateCollectionSchema>;
