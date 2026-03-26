import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { products } from './products.js';

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => users.id),
  merchantId: text('merchant_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  totalAmount: integer('total_amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
});
