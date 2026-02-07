import * as z from 'zod/v4';
import { roles } from '../../lib/project';

export const RegistrationRequestSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  role: z.enum(roles),
});

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
