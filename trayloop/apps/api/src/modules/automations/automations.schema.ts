import { z } from 'zod';

export const automationRuleTypeSchema = z.enum(['reactivation', 'reorder_reminder']);
export const automationSegmentSchema = z.enum(['at_risk', 'dormant', 'frequent']);
export const automationRuleStatusSchema = z.enum(['draft', 'active', 'paused', 'disabled']);
export const automationApprovalModeSchema = z.enum(['approval_required', 'autopilot']);
export const automationSmsModeSchema = z.enum(['disabled', 'copy_only']);
export const automationRunStatusSchema = z.enum([
  'pending_approval',
  'approved',
  'queued',
  'sent',
  'copied',
  'skipped',
  'failed',
  'canceled',
]);

export const automationRuleUpdateSchema = z.object({
  status: automationRuleStatusSchema.optional(),
  approvalMode: automationApprovalModeSchema.optional(),
  emailEnabled: z.boolean().optional(),
  smsMode: automationSmsModeSchema.optional(),
  timingWindowDays: z.coerce.number().int().min(1).max(30).optional(),
  throttleDays: z.coerce.number().int().min(1).max(90).optional(),
  maxTargets: z.coerce.number().int().min(1).max(100).optional(),
  goalNotes: z.string().trim().max(500).nullable().optional(),
  toneNotes: z.string().trim().max(500).nullable().optional(),
});

export const automationRunsQuerySchema = z.object({
  status: automationRunStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  ruleId: z.string().uuid().optional(),
});

export const automationEvaluateSchema = z.object({
  ruleIds: z.array(z.string().uuid()).max(20).optional(),
});

export const automationRunUpdateSchema = z.object({
  action: z.enum(['approve', 'skip', 'cancel', 'save']),
  generatedSubject: z.string().trim().max(255).optional(),
  generatedEmailBody: z.string().trim().max(5000).optional(),
  generatedSmsBody: z.string().trim().max(1000).optional(),
  scheduledFor: z.string().datetime().optional(),
  errorMessage: z.string().trim().max(1000).optional(),
});

export const automationProcessSchema = z.object({
  runIds: z.array(z.string().uuid()).max(100).optional(),
});

export type AutomationRuleType = z.infer<typeof automationRuleTypeSchema>;
export type AutomationSegment = z.infer<typeof automationSegmentSchema>;
export type AutomationRuleStatus = z.infer<typeof automationRuleStatusSchema>;
export type AutomationApprovalMode = z.infer<typeof automationApprovalModeSchema>;
export type AutomationSmsMode = z.infer<typeof automationSmsModeSchema>;
export type AutomationRunStatus = z.infer<typeof automationRunStatusSchema>;
export type AutomationRuleUpdateInput = z.infer<typeof automationRuleUpdateSchema>;
export type AutomationRunsQuery = z.infer<typeof automationRunsQuerySchema>;
export type AutomationEvaluateInput = z.infer<typeof automationEvaluateSchema>;
export type AutomationRunUpdateInput = z.infer<typeof automationRunUpdateSchema>;
export type AutomationProcessInput = z.infer<typeof automationProcessSchema>;
