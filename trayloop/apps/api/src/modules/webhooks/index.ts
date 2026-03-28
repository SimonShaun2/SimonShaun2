import type { FastifyInstance } from 'fastify';
import { db } from '@trayloop/database';
import { deposits, orders } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { getStripe, isStripeEnabled, getWebhookSecret } from '../../lib/stripe.js';
import { recordOrderEvent } from '../../lib/order-events.js';
import { logger } from '@trayloop/utils';

export async function webhookModule(app: FastifyInstance) {
  // Stripe sends raw body — we need to access it before JSON parsing
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => {
    done(null, body);
  });

  app.post('/stripe', async (request, reply) => {
    if (!isStripeEnabled()) {
      return reply.status(503).send({ error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured' } });
    }

    const sig = request.headers['stripe-signature'] as string | undefined;
    if (!sig) {
      return reply.status(400).send({ error: { code: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header' } });
    }

    // Verify webhook signature
    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body as Buffer,
        sig,
        getWebhookSecret(),
      );
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: (err as Error).message });
      return reply.status(400).send({ error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } });
    }

    logger.info('Stripe webhook received', { type: event.type, id: event.id });

    // Route event to handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    return reply.status(200).send({ received: true });
  });
}

// --- Event handlers ---

async function handleCheckoutSessionCompleted(session: any) {
  // Only handle deposit sessions
  if (session.metadata?.trayloop_deposit !== 'true') {
    logger.info('Ignoring non-deposit checkout session', { sessionId: session.id });
    return;
  }

  const orderId = session.metadata?.trayloop_order_id;
  const checkoutSessionId = session.id;
  const paymentIntentId = session.payment_intent as string | null;

  if (!orderId) {
    logger.error('Checkout session missing trayloop_order_id metadata', { sessionId: checkoutSessionId });
    return;
  }

  // Find the pending deposit by checkout session ID
  const [deposit] = await db
    .select({ id: deposits.id, status: deposits.status, orderId: deposits.orderId })
    .from(deposits)
    .where(eq(deposits.stripeCheckoutSessionId, checkoutSessionId))
    .limit(1);

  if (!deposit) {
    logger.error('No deposit found for checkout session', { checkoutSessionId, orderId });
    return;
  }

  // Idempotency: skip if already paid
  if (deposit.status === 'paid') {
    logger.info('Deposit already marked as paid, skipping', { depositId: deposit.id });
    return;
  }

  const now = new Date();

  // Transaction: update deposit + order status
  await db.transaction(async (tx) => {
    // Mark deposit as paid
    await tx.update(deposits).set({
      status: 'paid',
      stripePaymentIntentId: paymentIntentId,
      paidAt: now,
      updatedAt: now,
    }).where(eq(deposits.id, deposit.id));

    // Transition order to confirmed
    await tx.update(orders).set({
      status: 'confirmed',
      updatedAt: now,
    }).where(eq(orders.id, orderId));
  });

  // Record timeline events (non-critical)
  try {
    const amount = session.amount_total;
    await recordOrderEvent(orderId, 'deposit_paid', `Deposit of $${(amount / 100).toFixed(2)} paid via Stripe`);
    await recordOrderEvent(orderId, 'status_changed', 'Status changed to confirmed (deposit received)');
  } catch {}

  logger.info('Deposit payment completed via webhook', {
    depositId: deposit.id,
    orderId,
    paymentIntentId,
    amount: session.amount_total,
  });
}

async function handleCheckoutSessionExpired(session: any) {
  if (session.metadata?.trayloop_deposit !== 'true') return;

  const checkoutSessionId = session.id;
  const orderId = session.metadata?.trayloop_order_id;

  // Find the deposit
  const [deposit] = await db
    .select({ id: deposits.id, status: deposits.status })
    .from(deposits)
    .where(eq(deposits.stripeCheckoutSessionId, checkoutSessionId))
    .limit(1);

  if (!deposit || deposit.status !== 'pending') return;

  // Mark deposit as refunded (expired)
  await db.update(deposits).set({
    status: 'refunded',
    updatedAt: new Date(),
  }).where(eq(deposits.id, deposit.id));

  try {
    await recordOrderEvent(orderId, 'deposit_expired', 'Deposit payment link expired');
  } catch {}

  logger.info('Checkout session expired', { depositId: deposit.id, orderId });
}
