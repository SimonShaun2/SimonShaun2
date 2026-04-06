import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { locations } from './locations.js';
import { orders } from './orders.js';
import { addOns } from './catalogs.js';

export const upsellEvents = pgTable('upsell_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  addOnId: uuid('add_on_id')
    .notNull()
    .references(() => addOns.id, { onDelete: 'cascade' }),
  sessionKey: varchar('session_key', { length: 64 }).notNull(),
  eventType: varchar('event_type', { length: 20 }).notNull(),
  recommendationType: varchar('recommendation_type', { length: 50 }).notNull(),
  suggestedQuantity: integer('suggested_quantity').notNull().default(1),
  revenueCents: integer('revenue_cents').notNull().default(0),
  headline: text('headline'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
