import { z } from 'zod';
import { PLAN_KEYS } from '@trayloop/types';

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

export const merchantWorkspaceRegisterSchema = z.object({
  selectedPlan: z.enum(PLAN_KEYS),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
  organizationName: z.string().min(1).max(255),
  organizationSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  token: z.string(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
  app: z.enum(['merchant', 'admin', 'customer']),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
  app: z.enum(['merchant', 'admin', 'customer']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type MerchantWorkspaceRegisterInput = z.infer<typeof merchantWorkspaceRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
