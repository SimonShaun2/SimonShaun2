import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const customerIdParamsSchema = z.object({
  customerId: z.string().uuid(),
});

export const storefrontSlugParamsSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export const storefrontOrderParamsSchema = storefrontSlugParamsSchema.extend({
  orderId: z.string().uuid(),
});
