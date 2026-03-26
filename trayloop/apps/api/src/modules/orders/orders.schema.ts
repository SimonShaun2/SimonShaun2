import { z } from 'zod';

export const createOrderSchema = z.object({
  merchantId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
