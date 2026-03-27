import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { locations } from './locations.js';
import { customers } from './customers.js';
import { packages } from './catalogs.js';
import { orderStatusEnum, recurrenceIntervalEnum } from './enums.js';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 20 }).notNull(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  status: orderStatusEnum('status').notNull().default('submitted'),
  totalAmount: integer('total_amount').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  headCount: integer('head_count'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  packageId: uuid('package_id').references(() => packages.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const recurringOrders = pgTable('recurring_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  packageId: uuid('package_id').references(() => packages.id),
  interval: recurrenceIntervalEnum('interval').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  nextOccurrence: timestamp('next_occurrence', { withTimezone: true }),
  preferredDay: varchar('preferred_day', { length: 20 }),
  preferredTime: varchar('preferred_time', { length: 10 }),
  headCount: integer('head_count'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
