import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { catalogItemTypeEnum, packagePricingEnum } from './enums.js';

export const catalogs = pgTable('catalogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const catalogCategories = pgTable('catalog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => catalogCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  pricing: packagePricingEnum('pricing').notNull().default('flat'),
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  minHeadCount: integer('min_head_count'),
  maxHeadCount: integer('max_head_count'),
  imageUrl: text('image_url'),
  upsellEligible: boolean('upsell_eligible').notNull().default(false),
  upsellFeatured: boolean('upsell_featured').notNull().default(false),
  upsellPriority: integer('upsell_priority').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const packageItems = pgTable('package_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  packageId: uuid('package_id').notNull().references(() => packages.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: catalogItemTypeEnum('type').notNull().default('service'),
  isOptional: boolean('is_optional').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const addOns = pgTable('add_ons', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  upsellEligible: boolean('upsell_eligible').notNull().default(true),
  upsellFeatured: boolean('upsell_featured').notNull().default(false),
  upsellPriority: integer('upsell_priority').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
