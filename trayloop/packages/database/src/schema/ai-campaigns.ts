import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { users } from './users.js';
import { customers } from './customers.js';
import {
  aiCampaignChannelEnum,
  aiCampaignRecipientStatusEnum,
  aiCampaignSegmentEnum,
  aiCampaignStatusEnum,
} from './enums.js';

export const aiCampaigns = pgTable('ai_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  segment: aiCampaignSegmentEnum('segment').notNull(),
  channel: aiCampaignChannelEnum('channel').notNull(),
  status: aiCampaignStatusEnum('status').notNull().default('draft'),
  generatedSubject: text('generated_subject'),
  generatedEmailBody: text('generated_email_body'),
  generatedSmsBody: text('generated_sms_body'),
  selectedTargetCount: integer('selected_target_count').notNull().default(0),
  estimatedRevenueCents: integer('estimated_revenue_cents').notNull().default(0),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiCampaignRecipients = pgTable('ai_campaign_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => aiCampaigns.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  channel: aiCampaignChannelEnum('channel').notNull(),
  deliveryStatus: aiCampaignRecipientStatusEnum('delivery_status').notNull().default('pending'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
