import { z } from 'zod';

const idSchema = z.string().uuid();
const statusSchema = z.string().trim().min(1).max(32).regex(/^[a-z_]+$/i, 'Status must contain only letters and underscores');
const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const adminStatusParamsSchema = z.object({
  id: idSchema,
});

export const adminStatusBodySchema = z.object({
  status: statusSchema,
});

export const adminCreateTestAccountSchema = z.object({
  role: z.enum(['merchant', 'customer', 'admin']),
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().optional().or(z.literal('')),
  password: z.string().min(8).optional().or(z.literal('')),
  organizationName: z.string().trim().min(1).max(255).optional().or(z.literal('')),
  organizationSlug: slugSchema.optional().or(z.literal('')),
  companyName: z.string().trim().max(255).optional().or(z.literal('')),
});

export type AdminCreateTestAccountInput = z.infer<typeof adminCreateTestAccountSchema>;
