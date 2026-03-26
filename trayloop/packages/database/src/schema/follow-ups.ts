import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { orders } from './orders.js';
import { followUpStatusEnum } from './enums.js';

export const followUps = pgTable('follow_ups', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  status: followUpStatusEnum('status').notNull().default('pending'),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  note: text('note'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
