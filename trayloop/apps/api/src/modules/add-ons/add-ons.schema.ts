import { z } from 'zod';

export const createAddOnSchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const updateAddOnSchema = createAddOnSchema.omit({ catalogId: true }).partial();

export type CreateAddOnInput = z.infer<typeof createAddOnSchema>;
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>;
