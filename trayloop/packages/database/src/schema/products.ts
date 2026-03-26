import { pgTable, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
