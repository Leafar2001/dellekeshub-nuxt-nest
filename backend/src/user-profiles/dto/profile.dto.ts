import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarB64: z.string().optional(),
  bannerB64: z.string().optional(),
  favoriteGenres: z.array(z.string()).optional(),
  preferredLocale: z.enum(['en-US', 'nl-NL']).optional(),
  autoPlay: z.boolean().optional(),
  autoplayNextEpisode: z.boolean().optional(),
  volume: z.number().min(0).max(1).optional(),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
