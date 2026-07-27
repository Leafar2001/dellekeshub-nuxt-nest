import * as z from 'zod/v4';

export const UpdateMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email().nullable().optional(),
  avatarB64: z.string().nullable().optional(),
});

export type UpdateMe = z.infer<typeof UpdateMeSchema>;
