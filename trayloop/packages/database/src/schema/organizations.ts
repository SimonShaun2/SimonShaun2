import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { memberRoleEnum, memberStatusEnum, organizationPlanEnum } from './enums.js';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  website: text('website'),
  phone: varchar('phone', { length: 50 }),
  logoUrl: text('logo_url'),
  brandColor: varchar('brand_color', { length: 7 }),
  displayFont: text('display_font'),
  currentPlan: organizationPlanEnum('current_plan').notNull().default('starter'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  stripeAccountId: text('stripe_account_id'),
  stripeChargesEnabled: boolean('stripe_charges_enabled').notNull().default(false),
  stripePayoutsEnabled: boolean('stripe_payouts_enabled').notNull().default(false),
  stripeDetailsSubmitted: boolean('stripe_details_submitted').notNull().default(false),
  stripeOnboardingComplete: boolean('stripe_onboarding_complete').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMemberships = pgTable('organization_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull().default('staff'),
  status: memberStatusEnum('status').notNull().default('invited'),
  invitedAt: timestamp('invited_at', { withTimezone: true }).notNull().defaultNow(),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
