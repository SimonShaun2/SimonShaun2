import { db } from '@trayloop/database';
import { orderEvents } from '@trayloop/database';
import { eq, desc } from 'drizzle-orm';

export async function recordOrderEvent(
  orderId: string,
  type: string,
  description: string,
  metadata?: Record<string, unknown>,
  txDb?: typeof db,
) {
  const database = txDb ?? db;
  await database.insert(orderEvents).values({
    orderId,
    type,
    description,
    metadata: metadata ?? null,
  });
}

export async function getOrderTimeline(orderId: string) {
  return db
    .select({
      id: orderEvents.id,
      type: orderEvents.type,
      description: orderEvents.description,
      metadata: orderEvents.metadata,
      createdAt: orderEvents.createdAt,
    })
    .from(orderEvents)
    .where(eq(orderEvents.orderId, orderId))
    .orderBy(desc(orderEvents.createdAt));
}
