import { db } from '@trayloop/database';
import { notifications } from '@trayloop/database';
import { eq, desc } from 'drizzle-orm';

export async function listByUser(userId: string) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      subject: notifications.subject,
      body: notifications.body,
      actionUrl: notifications.actionUrl,
      status: notifications.status,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function unreadCount(userId: string): Promise<number> {
  const all = await db
    .select({ readAt: notifications.readAt })
    .from(notifications)
    .where(eq(notifications.userId, userId));
  return all.filter((n) => !n.readAt).length;
}

export async function markRead(id: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date(), status: 'read' })
    .where(eq(notifications.id, id));
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date(), status: 'read' })
    .where(eq(notifications.userId, userId));
}
