import * as z from 'zod/v4';
import { mediaTypes } from 'src/lib/project';

export const UpdateWatchProgressSchema = z.object({
  currentTime: z.number(),
  duration: z.number(),
  mediaType: z.enum(mediaTypes),
});

export type UpdateWatchProgress = z.infer<typeof UpdateWatchProgressSchema>;
