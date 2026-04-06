import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { aiCampaigns } from './ai-campaigns.js';
import { customers } from './customers.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const automationRules = pgTable('automation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  ruleType: varchar('rule_type', { length: 32 }).notNull(),
  segment: varchar('segment', { length: 32 }).notNull(),
  status: varchar('status', { length: 16 }).notNull().default('active'),
  approvalMode: varchar('approval_mode', { length: 24 }).notNull().default('approval_required'),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  smsMode: varchar('sms_mode', { length: 24 }).notNull().default('copy_only'),
  timingWindowDays: integer('timing_window_days').notNull().default(7),
  throttleDays: integer('throttle_days').notNull().default(7),
  maxTargets: integer('max_targets').notNull().default(25),
  goalNotes: text('goal_notes'),
  toneNotes: text('tone_notes'),
  lastEvaluatedAt: timestamp('last_evaluated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const automationRuns = pgTable('automation_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  automationRuleId: uuid('automation_rule_id')
    .notNull()
    .references(() => automationRules.id, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  aiCampaignId: uuid('ai_campaign_id').references(() => aiCampaigns.id, { onDelete: 'set null' }),
  ruleType: varchar('rule_type', { length: 32 }).notNull(),
  segment: varchar('segment', { length: 32 }).notNull(),
  executionMode: varchar('execution_mode', { length: 24 }).notNull().default('scheduled'),
  status: varchar('status', { length: 24 }).notNull().default('pending_approval'),
  reasonSummary: text('reason_summary').notNull(),
  generatedSubject: text('generated_subject'),
  generatedEmailBody: text('generated_email_body'),
  generatedSmsBody: text('generated_sms_body'),
  selectedTargetCount: integer('selected_target_count').notNull().default(0),
  estimatedRevenueCents: integer('estimated_revenue_cents').notNull().default(0),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const automationRunRecipients = pgTable('automation_run_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  automationRunId: uuid('automation_run_id')
    .notNull()
    .references(() => automationRuns.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 24 }).notNull().default('email'),
  deliveryStatus: varchar('delivery_status', { length: 24 }).notNull().default('pending'),
  skipReason: text('skip_reason'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
