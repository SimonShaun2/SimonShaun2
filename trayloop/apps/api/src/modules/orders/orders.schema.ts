import { z } from 'zod';

export const orderStatus = z.enum([
  'draft',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
]);

export const createOrderSchema = z.object({
  orgId: z.string(),
  customerId: z.string(),
  locationId: z.string().optional(),
  items: z.array(z.object({
    catalogItemId: z.string(),
    packageId: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().int().nonnegative(),
  })).min(1),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatus,
  reason: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
