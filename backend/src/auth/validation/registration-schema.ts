import * as z from 'zod/v4';

export const RegistrationRequestSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
