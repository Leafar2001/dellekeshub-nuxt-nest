import { z } from 'zod/v4';
import { LocalizedStringSchema } from '../../lib/validation/localization';

export const CreateMediaCollectionSchema = z.object({
  slug: z.string().min(1).max(100),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  type: z.enum(['movie', 'series']),
  releaseDate: z.date().optional(),
  movieVideoId: z.string().optional(),
  trailerVideoId: z.string().optional(),
  posterImageIds: z.array(z.string()).default([]),
  backdropImageIds: z.array(z.string()).default([]),
  screenshotImageIds: z.array(z.string()).default([]),
  runtime: z.number().optional(),
});

export type CreateMediaCollectionDto = z.infer<
  typeof CreateMediaCollectionSchema
>;

export const UpdateMediaCollectionSchema =
  CreateMediaCollectionSchema.partial();

export type UpdateMediaCollectionDto = z.infer<
  typeof UpdateMediaCollectionSchema
>;
