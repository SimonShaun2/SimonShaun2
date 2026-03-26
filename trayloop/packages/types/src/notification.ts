export type NotificationType = 'email' | 'in_app' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  subject: string;
  body: string;
  status: NotificationStatus;
  sentAt: Date | null;
  createdAt: Date;
}
