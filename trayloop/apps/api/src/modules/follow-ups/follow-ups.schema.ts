import { z } from 'zod';

export const followUpStatus = z.enum(['pending', 'completed']);

export const createFollowUpSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  dueDate: z.string().datetime('Invalid date format — use ISO 8601'),
  note: z.string().max(2000).trim().optional(),
});

export const updateFollowUpSchema = z.object({
  dueDate: z.string().datetime().optional(),
  note: z.string().max(2000).trim().optional(),
  status: followUpStatus.optional(),
});

export const followUpListQuerySchema = z.object({
  status: followUpStatus.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
export type FollowUpListQuery = z.infer<typeof followUpListQuerySchema>;
