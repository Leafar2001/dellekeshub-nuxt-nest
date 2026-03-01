import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username must be at least 1 character"),
  password: z.string().min(1, "Password must be at least 1 character"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(1, "Username must be at least 1 character"),
  password: z.string().min(1, "Password must be at least 1 character"),
  role: z.enum(["user", "admin"], "Role must be either 'user' or 'admin'"),
});

export type RegisterInput = z.infer<typeof registerSchema>;