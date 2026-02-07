import * as z from 'zod/v4';
import { LocalizedStringSchema } from '../../lib/validation/localization';

export const createVideoSchema = z.object({
  title: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  trailer: LocalizedStringSchema.optional(),
  genres: z.array(z.string()).optional(),
  path: z.string(),
  releaseDate: z.date().optional(),
  introStart: z.number().optional(),
  introEnd: z.number().optional(),
  outroStart: z.number().optional(),
  outroEnd: z.number().optional(),
  duration: z.number().optional(),
});

export type CreateVideo = z.infer<typeof createVideoSchema>;
