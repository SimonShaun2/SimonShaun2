import { z } from 'zod';

export const catalogItemType = z.enum(['service', 'physical_good', 'digital_good', 'bundle']);

export const createCatalogItemSchema = z.object({
  orgId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().default(''),
  type: catalogItemType.default('service'),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateCatalogItemSchema = createCatalogItemSchema.omit({ orgId: true }).partial();

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;
