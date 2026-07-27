import * as z from 'zod/v4';

export const RegisterUserSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  inviteCode: z.string().min(1),
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;
