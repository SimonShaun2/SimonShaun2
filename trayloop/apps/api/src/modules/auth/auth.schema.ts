import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

export const customerRegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  password: z.string().min(8),
  phone: z.string().min(7).max(50).optional(),
  companyName: z.string().min(1).max(255).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
