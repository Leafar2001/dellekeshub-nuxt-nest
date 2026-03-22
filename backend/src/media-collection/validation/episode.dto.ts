import { z } from 'zod/v4';
import { LocalizedStringSchema } from '../../lib/validation/localization';

export const CreateEpisodeSchema = z.object({
  episodeNumber: z.number().int().positive(),
  videoId: z.string(),
  title: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  airDate: z.date().optional(),
});

export type CreateEpisodeDto = z.infer<typeof CreateEpisodeSchema>;

export const UpdateEpisodeSchema = CreateEpisodeSchema.partial();

export type UpdateEpisodeDto = z.infer<typeof UpdateEpisodeSchema>;
