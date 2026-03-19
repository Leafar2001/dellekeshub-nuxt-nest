import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProgressSchema = z.object({
  currentTime: z.number(),
  duration: z.number(),
});

export class UpdateProgressDto extends createZodDto(UpdateProgressSchema) {}
