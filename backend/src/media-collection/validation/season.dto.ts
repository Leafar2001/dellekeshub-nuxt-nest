import { z } from 'zod/v4';

export const CreateSeasonSchema = z.object({
  seasonNumber: z.number().int().positive(),
  posterImageId: z.string().optional(),
});

export type CreateSeasonDto = z.infer<typeof CreateSeasonSchema>;
