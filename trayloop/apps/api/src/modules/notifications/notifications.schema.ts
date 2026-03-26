import { z } from 'zod';

export const notificationType = z.enum(['email', 'in_app', 'push', 'sms']);
export const notificationStatus = z.enum(['pending', 'sent', 'read', 'failed']);

export const createNotificationSchema = z.object({
  userId: z.string(),
  type: notificationType,
  subject: z.string().max(255),
  body: z.string(),
  channel: notificationType.default('in_app'),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
