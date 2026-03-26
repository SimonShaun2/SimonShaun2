import { z } from 'zod';

export const createPackageSchema = z.object({
  orgId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().default(''),
  catalogItemIds: z.array(z.string()).min(1),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  recurrenceInterval: z.enum(['one_time', 'weekly', 'biweekly', 'monthly', 'quarterly']).default('one_time'),
  isActive: z.boolean().default(true),
});

export const updatePackageSchema = createPackageSchema.omit({ orgId: true }).partial();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
