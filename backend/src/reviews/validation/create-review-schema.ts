import * as z from 'zod/v4';
import { mediaTypes } from 'src/lib/project';

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  mediaType: z.enum(mediaTypes),
});

export type CreateReview = z.infer<typeof CreateReviewSchema>;
