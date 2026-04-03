import { z } from 'zod';

export const aiCampaignSegmentSchema = z.enum(['frequent', 'at_risk', 'dormant']);
export const aiCampaignChannelSchema = z.enum(['email', 'sms_copy']);
export const aiCampaignStatusSchema = z.enum(['draft', 'sent', 'copied']);
export const aiCampaignKindSchema = z.enum(['reactivation', 'reorder_reminder']);

export const reactivationTargetsQuerySchema = z.object({
  segment: aiCampaignSegmentSchema,
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const reorderOpportunitiesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(10).default(5),
});

export const generateCampaignMessageSchema = z.object({
  segment: aiCampaignSegmentSchema,
  selectedCustomerIds: z.array(z.string().uuid()).min(1).max(100),
  channelIntent: aiCampaignChannelSchema.default('email'),
  campaignKind: aiCampaignKindSchema.default('reactivation'),
  goalNotes: z.string().trim().max(500).optional(),
  toneNotes: z.string().trim().max(500).optional(),
});

export const createCampaignSchema = z.object({
  segment: aiCampaignSegmentSchema,
  channel: aiCampaignChannelSchema,
  status: aiCampaignStatusSchema,
  selectedCustomerIds: z.array(z.string().uuid()).min(1).max(100),
  generatedSubject: z.string().trim().min(1).max(255),
  generatedEmailBody: z.string().trim().min(1).max(5000),
  generatedSmsBody: z.string().trim().min(1).max(1000),
}).superRefine((value, ctx) => {
  if (value.status === 'sent' && value.channel !== 'email') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sent campaigns must use the email channel.',
      path: ['channel'],
    });
  }

  if (value.status === 'copied' && value.channel !== 'sms_copy') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Copied campaigns must use the SMS copy channel.',
      path: ['channel'],
    });
  }
});

export const listCampaignsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(5),
});

export type ReactivationTargetsQuery = z.infer<typeof reactivationTargetsQuerySchema>;
export type ReorderOpportunitiesQuery = z.infer<typeof reorderOpportunitiesQuerySchema>;
export type GenerateCampaignMessageInput = z.infer<typeof generateCampaignMessageSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
