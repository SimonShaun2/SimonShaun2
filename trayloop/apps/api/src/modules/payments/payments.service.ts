import Stripe from 'stripe';
import { db } from '@trayloop/database';
import { payments, orders } from '@trayloop/database';
import { generateId } from '@trayloop/utils';
import { logger } from '@trayloop/utils';
import { NotFoundError } from '../../lib/errors.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckout(orderId: string, eventBus: EventBus) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new NotFoundError('Order');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.totalAmount,
    currency: order.currency.toLowerCase(),
    metadata: { orderId },
  });

  await db.insert(payments).values({
    id: generateId(),
    orderId,
    stripePaymentIntentId: paymentIntent.id,
    amount: order.totalAmount,
    currency: order.currency,
    status: 'processing',
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function handleWebhook(request: FastifyRequest, eventBus: EventBus) {
  const sig = request.headers['stripe-signature'] as string;
  const event = stripe.webhooks.constructEvent(
    request.body as string,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    await db.update(payments)
      .set({ status: 'succeeded' })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

    const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, paymentIntent.id)).limit(1);

    await eventBus.emit('payment.completed', {
      paymentId: payment.id,
      orderId,
      amount: paymentIntent.amount,
    });

    logger.info('Payment succeeded', { orderId });
  }
}
