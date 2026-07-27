import * as z from 'zod/v4';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
