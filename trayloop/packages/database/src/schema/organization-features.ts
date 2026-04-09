import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { organizationFeatureKeyEnum } from './enums.js';

export const organizationFeatures = pgTable(
  'organization_features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    featureKey: organizationFeatureKeyEnum('feature_key').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    source: text('source').notNull().default('subscription'),
    stripePriceId: text('stripe_price_id'),
    stripeSubscriptionItemId: text('stripe_subscription_item_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    organizationFeatureUnique: uniqueIndex('organization_features_org_feature_key_idx').on(
      table.organizationId,
      table.featureKey,
    ),
  }),
);
