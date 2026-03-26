import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { notificationTypeEnum, notificationStatusEnum } from './enums.js';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull().default('in_app'),
  status: notificationStatusEnum('status').notNull().default('pending'),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  actionUrl: text('action_url'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
