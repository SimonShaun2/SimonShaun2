import type { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { db } from '@trayloop/database';
import { customers, deposits, orders, organizations, subscriptions } from '@trayloop/database';
import { and, eq, inArray } from 'drizzle-orm';
import { getStripe, getWebhookSecret, isStripeEnabled } from '../../lib/stripe.js';
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

type LocalSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

function logDepositWebhook(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown>,
) {
  logger[level](message, {
    source: 'stripe-webhook',
    area: 'deposit',
    ...context,
  });
}

function logSubscriptionWebhook(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown>,
) {
  logger[level](message, {
    source: 'stripe-webhook',
    area: 'subscription',
    ...context,
  });
}

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status | string): LocalSubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'unpaid';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    case 'incomplete':
    case 'paused':
      return 'past_due';
    default:
      return 'unpaid';
  }
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

async function resolveSubscriptionOrganizationId(subscription: Stripe.Subscription) {
  const metadataOrgId = subscription.metadata?.trayloop_org_id;
  if (metadataOrgId) {
    return metadataOrgId;
  }

  const [existingBySubscription] = await db
    .select({ organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existingBySubscription) {
    return existingBySubscription.organizationId;
  }

  const stripeCustomerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null;

  if (!stripeCustomerId) {
    return null;
  }

  const [existingByCustomer] = await db
    .select({ organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return existingByCustomer?.organizationId ?? null;
}

async function upsertSubscriptionSnapshot(
  eventId: string,
  eventType: string,
  subscription: Stripe.Subscription,
  overrideStatus?: LocalSubscriptionStatus,
) {
  const organizationId = await resolveSubscriptionOrganizationId(subscription);
  const stripeCustomerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null;

  if (!organizationId || !stripeCustomerId) {
    logSubscriptionWebhook('warn', 'Subscription webhook skipped because merchant mapping was missing', {
      eventId,
      eventType,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId,
      action: 'skipped',
    });
    return null;
  }

  const primaryItem = subscription.items.data[0];
  const status = overrideStatus ?? normalizeSubscriptionStatus(subscription.status);
  const currentPeriodStart = subscription.items.data.length > 0
    ? new Date(subscription.current_period_start * 1000)
    : null;
  const currentPeriodEnd = subscription.items.data.length > 0
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const [record] = await db
    .insert(subscriptions)
    .values({
      organizationId,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId:
        typeof primaryItem?.price === 'string'
          ? primaryItem.price
          : primaryItem?.price?.id ?? null,
      status,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId:
          typeof primaryItem?.price === 'string'
            ? primaryItem.price
            : primaryItem?.price?.id ?? null,
        status,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        currentPeriodStart,
        currentPeriodEnd,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: subscriptions.id,
      organizationId: subscriptions.organizationId,
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      status: subscriptions.status,
    });

  logSubscriptionWebhook('info', 'Subscription snapshot synced', {
    eventId,
    eventType,
    organizationId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    status: record.status,
    action: 'applied',
  });

  return record;
}

export async function webhookModule(app: FastifyInstance) {
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

    logger.info('Stripe webhook received', {
      source: 'stripe-webhook',
      eventId: event.id,
      eventType: event.type,
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.id, event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.id, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChanged(event.id, event.type, event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.id, event.data.object as Stripe.Invoice);
        break;
      default:
        logger.info('Unhandled webhook event type', {
          source: 'stripe-webhook',
          eventId: event.id,
          eventType: event.type,
        });
    }

    return reply.status(200).send({ received: true });
  });
}

async function handleSubscriptionChanged(
  eventId: string,
  eventType: string,
  subscription: Stripe.Subscription,
) {
  const overrideStatus = eventType === 'customer.subscription.deleted' ? 'canceled' : undefined;
  await upsertSubscriptionSnapshot(eventId, eventType, subscription, overrideStatus);
}

async function handleInvoicePaymentFailed(eventId: string, invoice: Stripe.Invoice) {
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (!stripeSubscriptionId) {
    logSubscriptionWebhook('warn', 'Invoice payment failed event skipped because subscription was missing', {
      eventId,
      invoiceId: invoice.id,
      action: 'skipped',
    });
    return;
  }

  const [updated] = await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
        inArray(subscriptions.status, ['trialing', 'active', 'past_due', 'unpaid']),
      ),
    )
    .returning({
      id: subscriptions.id,
      organizationId: subscriptions.organizationId,
      status: subscriptions.status,
    });

  if (!updated) {
    logSubscriptionWebhook('info', 'Invoice payment failed event skipped because subscription snapshot was not mutable', {
      eventId,
      invoiceId: invoice.id,
      stripeSubscriptionId,
      action: 'skipped',
    });
    return;
  }

  logSubscriptionWebhook('warn', 'Subscription marked past_due after invoice payment failure', {
    eventId,
    invoiceId: invoice.id,
    stripeSubscriptionId,
    organizationId: updated.organizationId,
    status: updated.status,
    action: 'applied',
  });
}

async function handleCheckoutSessionCompleted(eventId: string, session: Stripe.Checkout.Session) {
  if (session.metadata?.trayloop_deposit !== 'true') {
    logDepositWebhook('info', 'Ignoring non-deposit checkout session', {
      eventId,
      checkoutSessionId: session.id,
      action: 'skipped',
    });
    return;
  }

  const orderId = session.metadata?.trayloop_order_id;
  const checkoutSessionId = session.id;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
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

  try {
    await recordOrderEvent(orderId, 'deposit_paid', `Deposit of $${(amount / 100).toFixed(2)} paid via Stripe`);
    if (result.order?.status === 'confirmed') {
      await recordOrderEvent(orderId, 'status_changed', 'Status changed to confirmed (deposit received)');
    }
  } catch {}

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

async function handleCheckoutSessionExpired(eventId: string, session: Stripe.Checkout.Session) {
  if (session.metadata?.trayloop_deposit !== 'true') {
    logDepositWebhook('info', 'Ignoring non-deposit expired checkout session', {
      eventId,
      checkoutSessionId: session.id,
      action: 'skipped',
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
