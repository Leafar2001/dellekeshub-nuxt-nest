import * as z from 'zod/v4';
import { roles } from '../../lib/project';

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  role: z.enum(roles).optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
