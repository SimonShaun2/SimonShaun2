import { z } from 'zod';

export const paymentStatus = z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded']);

export const createCheckoutSchema = z.object({
  orderId: z.string(),
  paymentMethodId: z.string().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
