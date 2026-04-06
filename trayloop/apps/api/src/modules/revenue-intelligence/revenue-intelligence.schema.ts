import { z } from 'zod';

export const revenueRangeSchema = z.enum(['7d', '30d', 'mtd', 'prev_month']).default('30d');

export const revenueSummaryQuerySchema = z.object({
  range: revenueRangeSchema.default('30d'),
});

export const revenueInsightEventSchema = z.object({
  eventType: z.enum(['shown', 'clicked', 'actioned']),
  itemType: z.enum(['insight', 'recommendation', 'opportunity', 'report']),
  itemKey: z.string().trim().min(1).max(128),
  page: z.enum(['dashboard', 'report']).default('dashboard'),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export type RevenueRange = z.infer<typeof revenueRangeSchema>;
export type RevenueSummaryQuery = z.infer<typeof revenueSummaryQuerySchema>;
export type RevenueInsightEventInput = z.infer<typeof revenueInsightEventSchema>;
