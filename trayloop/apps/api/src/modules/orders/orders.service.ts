import { db } from '@trayloop/database';
import { orders, orderItems, products } from '@trayloop/database';
import { generateId } from '@trayloop/utils';
import { NotFoundError } from '../../lib/errors.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput } from './orders.schema.js';
import { eq } from 'drizzle-orm';

export async function listOrders(customerId: string) {
  return db.select().from(orders).where(eq(orders.customerId, customerId));
}

export async function getOrder(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw new NotFoundError('Order');
  return order;
}

export async function createOrder(customerId: string, input: CreateOrderInput, eventBus: EventBus) {
  const orderId = generateId();

  // Fetch product prices
  let totalAmount = 0;
  const itemValues = [];
  for (const item of input.items) {
    const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
    if (!product) throw new NotFoundError('Product');
    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;
    itemValues.push({ id: generateId(), orderId, productId: item.productId, quantity: item.quantity, unitPrice: product.price });
  }

  const [order] = await db.insert(orders).values({ id: orderId, customerId, merchantId: input.merchantId, totalAmount }).returning();
  await db.insert(orderItems).values(itemValues);

  await eventBus.emit('order.created', { orderId, customerId, merchantId: input.merchantId });

  return order;
}
