import { z } from 'zod';

export const paymentCheckoutSchema = z.object({
  orderId: z.string().uuid(),
});

export const paymentOrderParamsSchema = z.object({
  orderId: z.string().uuid(),
});
