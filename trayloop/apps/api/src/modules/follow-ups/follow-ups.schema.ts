import { z } from 'zod';

export const followUpType = z.enum(['feedback_request', 'review_request', 'check_in', 'upsell', 'custom']);

export const createFollowUpSchema = z.object({
  orgId: z.string(),
  customerId: z.string(),
  orderId: z.string().optional(),
  type: followUpType,
  scheduledAt: z.string().datetime(),
  message: z.string().optional(),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
