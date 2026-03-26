import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 2 }).notNull().default('US'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const locationSettings = pgTable('location_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id').notNull().references(() => locations.id, { onDelete: 'cascade' }).unique(),
  leadTimeDays: integer('lead_time_days').notNull().default(3),
  minOrderAmount: integer('min_order_amount').default(0),
  maxOrderAmount: integer('max_order_amount'),
  serviceTypes: jsonb('service_types').$type<string[]>().notNull().default(['delivery']),
  deliveryEnabled: boolean('delivery_enabled').notNull().default(true),
  pickupEnabled: boolean('pickup_enabled').notNull().default(false),
  deliveryRadius: integer('delivery_radius_miles'),
  operatingHours: jsonb('operating_hours').$type<Record<string, { open: string; close: string }>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
