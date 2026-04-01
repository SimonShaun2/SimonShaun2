import type { FastifyInstance } from 'fastify';
import { db } from '@trayloop/database';
import { deposits, orders, customers, organizations } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { getStripe, isStripeEnabled, getWebhookSecret } from '../../lib/stripe.js';
import { recordOrderEvent } from '../../lib/order-events.js';
import { notifyDepositPaid } from '../../lib/notifications.js';
import { logger } from '@trayloop/utils';

type DepositSession = {
  id: string;
  status: string;
  orderId: string;
  amount: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
};

function logDepositWebhook(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown>,
) {
  logger[level](message, {
    source: 'stripe-webhook',
    ...context,
  });
}

async function getDepositBySession(checkoutSessionId: string): Promise<DepositSession | null> {
  const [deposit] = await db
    .select({
      id: deposits.id,
      status: deposits.status,
      orderId: deposits.orderId,
      amount: deposits.amount,
      currency: deposits.currency,
      stripeCheckoutSessionId: deposits.stripeCheckoutSessionId,
      stripePaymentIntentId: deposits.stripePaymentIntentId,
    })
    .from(deposits)
    .where(eq(deposits.stripeCheckoutSessionId, checkoutSessionId))
    .limit(1);

  return deposit ?? null;
}

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

    logDepositWebhook('info', 'Stripe webhook received', {
      eventId: event.id,
      eventType: event.type,
    });

    // Route event to handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.id, event.data.object);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.id, event.data.object);
        break;

      default:
        logDepositWebhook('info', 'Unhandled webhook event type', {
          eventId: event.id,
          eventType: event.type,
        });
    }

    return reply.status(200).send({ received: true });
  });
}

// --- Event handlers ---

async function handleCheckoutSessionCompleted(eventId: string, session: any) {
  // Only handle deposit sessions
  if (session.metadata?.trayloop_deposit !== 'true') {
    logDepositWebhook('info', 'Ignoring non-deposit checkout session', {
      eventId,
      checkoutSessionId: session.id,
    });
    return;
  }

  const orderId = session.metadata?.trayloop_order_id;
  const checkoutSessionId = session.id;
  const paymentIntentId = session.payment_intent as string | null;
  const amount = session.amount_total ?? 0;

  if (!orderId) {
    logDepositWebhook('error', 'Checkout session missing trayloop_order_id metadata', {
      eventId,
      checkoutSessionId,
    });
    return;
  }

  const deposit = await getDepositBySession(checkoutSessionId);
  if (!deposit) {
    logDepositWebhook('error', 'No deposit found for checkout session', {
      eventId,
      checkoutSessionId,
      orderId,
    });
    return;
  }

  if (deposit.status === 'paid') {
    logDepositWebhook('info', 'Completed event skipped for already-paid deposit', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: deposit.id,
      depositStatus: deposit.status,
      action: 'skipped',
    });
    return;
  }

  if (deposit.status === 'refunded') {
    logDepositWebhook('warn', 'Completed event skipped for refunded deposit', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: deposit.id,
      depositStatus: deposit.status,
      action: 'skipped',
    });
    return;
  }

  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [updatedDeposit] = await tx
      .update(deposits)
      .set({
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
        paidAt: now,
        updatedAt: now,
      })
      .where(and(eq(deposits.id, deposit.id), eq(deposits.status, 'pending')))
      .returning({
        id: deposits.id,
        status: deposits.status,
        orderId: deposits.orderId,
      });

    if (!updatedDeposit) {
      const currentDeposit = await getDepositBySession(checkoutSessionId);
      return {
        applied: false as const,
        deposit: currentDeposit,
        order: null,
      };
    }

    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: 'confirmed',
        updatedAt: now,
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, 'awaiting_deposit')))
      .returning({
        id: orders.id,
        status: orders.status,
        customerId: orders.customerId,
        organizationId: orders.organizationId,
        orderNumber: orders.orderNumber,
        scheduledAt: orders.scheduledAt,
      });

    const [currentOrder] = updatedOrder
      ? [updatedOrder]
      : await tx
          .select({
            id: orders.id,
            status: orders.status,
            customerId: orders.customerId,
            organizationId: orders.organizationId,
            orderNumber: orders.orderNumber,
            scheduledAt: orders.scheduledAt,
          })
          .from(orders)
          .where(eq(orders.id, orderId))
          .limit(1);

    return {
      applied: true as const,
      deposit: updatedDeposit,
      order: currentOrder ?? null,
    };
  });

  if (!result.applied) {
    logDepositWebhook('info', 'Completed event skipped after concurrent processing', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: result.deposit?.id ?? deposit.id,
      depositStatus: result.deposit?.status ?? deposit.status,
      action: 'skipped',
    });
    return;
  }

  // Record timeline events (non-critical, idempotent by being after status check)
  try {
    await recordOrderEvent(orderId, 'deposit_paid', `Deposit of $${(amount / 100).toFixed(2)} paid via Stripe`);
    if (result.order?.status === 'confirmed') {
      await recordOrderEvent(orderId, 'status_changed', 'Status changed to confirmed (deposit received)');
    }
  } catch {}

  // Send payment confirmation notifications
  try {
    if (result.order?.status === 'confirmed') {
      const [[customer], [org]] = await Promise.all([
        db.select({
          userId: customers.userId,
          email: customers.email,
          firstName: customers.firstName,
          lastName: customers.lastName,
        }).from(customers).where(eq(customers.id, result.order.customerId)).limit(1),
        db.select({
          name: organizations.name,
          ownerId: organizations.ownerId,
        }).from(organizations).where(eq(organizations.id, result.order.organizationId)).limit(1),
      ]);

      if (customer && org) {
        await notifyDepositPaid({
          orderId,
          orderNumber: result.order.orderNumber,
          merchantName: org.name,
          depositAmount: amount,
          currency: 'usd',
          eventDate: result.order.scheduledAt,
          customerUserId: customer.userId,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          merchantOwnerUserId: org.ownerId,
        });
      }
    }
  } catch (err) {
    logDepositWebhook('error', 'Failed to send deposit notifications', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: deposit.id,
      error: (err as Error).message,
    });
  }

  logDepositWebhook('info', 'Deposit payment completed via webhook', {
    eventId,
    checkoutSessionId,
    depositId: deposit.id,
    orderId,
    paymentIntentId,
    amount,
    orderStatus: result.order?.status ?? null,
    action: 'applied',
  });
}

async function handleCheckoutSessionExpired(eventId: string, session: any) {
  if (session.metadata?.trayloop_deposit !== 'true') {
    logDepositWebhook('info', 'Ignoring non-deposit expired checkout session', {
      eventId,
      checkoutSessionId: session.id,
    });
    return;
  }

  const checkoutSessionId = session.id;
  const orderId = session.metadata?.trayloop_order_id;

  const deposit = await getDepositBySession(checkoutSessionId);

  if (!deposit) {
    logDepositWebhook('warn', 'Expired event skipped because no deposit was found', {
      eventId,
      checkoutSessionId,
      orderId,
      action: 'skipped',
    });
    return;
  }

  if (deposit.status === 'paid') {
    logDepositWebhook('info', 'Expired event skipped for already-paid deposit', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: deposit.id,
      depositStatus: deposit.status,
      action: 'skipped',
    });
    return;
  }

  if (deposit.status === 'refunded') {
    logDepositWebhook('info', 'Expired event skipped for already-refunded deposit', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: deposit.id,
      depositStatus: deposit.status,
      action: 'skipped',
    });
    return;
  }

  const [expiredDeposit] = await db.update(deposits).set({
    status: 'refunded',
    updatedAt: new Date(),
  }).where(and(eq(deposits.id, deposit.id), eq(deposits.status, 'pending'))).returning({
    id: deposits.id,
    status: deposits.status,
  });

  if (!expiredDeposit) {
    const currentDeposit = await getDepositBySession(checkoutSessionId);
    logDepositWebhook('info', 'Expired event skipped after concurrent processing', {
      eventId,
      checkoutSessionId,
      orderId,
      depositId: currentDeposit?.id ?? deposit.id,
      depositStatus: currentDeposit?.status ?? deposit.status,
      action: 'skipped',
    });
    return;
  }

  try {
    await recordOrderEvent(orderId, 'deposit_expired', 'Deposit payment link expired');
  } catch {}

  logDepositWebhook('info', 'Checkout session expired', {
    eventId,
    checkoutSessionId,
    depositId: expiredDeposit.id,
    orderId,
    depositStatus: expiredDeposit.status,
    action: 'applied',
  });
}
