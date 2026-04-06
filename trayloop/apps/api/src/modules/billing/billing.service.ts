import { db, organizations, subscriptions, users } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { ValidationError } from '../../lib/errors.js';
import { getStripe, getSubscriptionPriceId, getSubscriptionTrialDays, isStripeEnabled } from '../../lib/stripe.js';
import { logger } from '@trayloop/utils';
import type { BillingCheckoutInput, BillingPortalInput } from './billing.schema.js';

const PLAN_NAME = 'TrayLoop Pro';
const PLAN_INTERVAL = 'month';
const PLAN_AMOUNT_CENTS = 4900;

type BillingState = 'not_started' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
type LocalSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

function normalizeBaseUrl(raw: string) {
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return raw.replace(/\/+$/, '');
  }
}

function getMerchantBaseUrl() {
  return normalizeBaseUrl(process.env.MERCHANT_URL || 'https://dashboard.trayloophq.com');
}

function withQueryParam(url: string, key: string, value: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(key, value);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

function formatIso(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

function getTrialDaysRemaining(trialEnd: Date | null | undefined) {
  if (!trialEnd) {
    return null;
  }

  const diff = trialEnd.getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
}

function buildCheckoutUrls(input: BillingCheckoutInput) {
  const base = `${getMerchantBaseUrl()}/settings`;
  return {
    successUrl: input.successUrl ?? withQueryParam(base, 'billing', 'success'),
    cancelUrl: input.cancelUrl ?? withQueryParam(base, 'billing', 'cancel'),
  };
}

function buildPortalReturnUrl(input: BillingPortalInput) {
  return input.returnUrl ?? `${getMerchantBaseUrl()}/settings#billing`;
}

function mapSubscriptionStatus(status: LocalSubscriptionStatus | null | undefined): BillingState {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'unpaid':
      return 'unpaid';
    default:
      return 'not_started';
  }
}

async function getBillingRecord(orgId: string) {
  const [record] = await db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      ownerEmail: users.email,
      ownerName: users.name,
      subscriptionId: subscriptions.id,
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      stripePriceId: subscriptions.stripePriceId,
      status: subscriptions.status,
      trialStart: subscriptions.trialStart,
      trialEnd: subscriptions.trialEnd,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      canceledAt: subscriptions.canceledAt,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
    })
    .from(organizations)
    .innerJoin(users, eq(users.id, organizations.ownerId))
    .leftJoin(subscriptions, eq(subscriptions.organizationId, organizations.id))
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!record) {
    throw new ValidationError('Organization not found');
  }

  return record;
}

function buildSubscriptionResponse(record: Awaited<ReturnType<typeof getBillingRecord>>) {
  const state = mapSubscriptionStatus(record.status);
  const trialDaysRemaining = getTrialDaysRemaining(record.trialEnd);
  const hasStripeCustomer = Boolean(record.stripeCustomerId);

  return {
    organizationId: record.organizationId,
    organizationName: record.organizationName,
    planName: PLAN_NAME,
    priceCents: PLAN_AMOUNT_CENTS,
    interval: PLAN_INTERVAL,
    state,
    canCheckout: state === 'not_started' || state === 'canceled',
    canManage: hasStripeCustomer && state !== 'not_started',
    trialDaysRemaining,
    subscription: record.subscriptionId
      ? {
          id: record.subscriptionId,
          stripeCustomerId: record.stripeCustomerId,
          stripeSubscriptionId: record.stripeSubscriptionId,
          stripePriceId: record.stripePriceId,
          status: record.status,
          trialStart: formatIso(record.trialStart),
          trialEnd: formatIso(record.trialEnd),
          currentPeriodStart: formatIso(record.currentPeriodStart),
          currentPeriodEnd: formatIso(record.currentPeriodEnd),
          canceledAt: formatIso(record.canceledAt),
          createdAt: formatIso(record.createdAt),
          updatedAt: formatIso(record.updatedAt),
        }
      : null,
  };
}

async function createStripeCustomer(record: Awaited<ReturnType<typeof getBillingRecord>>) {
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: record.ownerEmail,
    name: record.organizationName,
    metadata: {
      trayloop_org_id: record.organizationId,
      trayloop_org_slug: record.organizationSlug,
      trayloop_owner_name: record.ownerName,
    },
  });

  logger.info('Stripe billing customer created', {
    organizationId: record.organizationId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function createCheckoutSession(orgId: string, input: BillingCheckoutInput) {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  const priceId = getSubscriptionPriceId();
  const record = await getBillingRecord(orgId);
  const state = mapSubscriptionStatus(record.status);

  if (state === 'active' || state === 'trialing' || state === 'past_due' || state === 'unpaid') {
    throw new ValidationError('A subscription already exists for this merchant. Use manage subscription instead.');
  }

  const stripe = getStripe();
  const stripeCustomerId = record.stripeCustomerId ?? await createStripeCustomer(record);
  const { successUrl, cancelUrl } = buildCheckoutUrls(input);
  const trialDays = getSubscriptionTrialDays();
  const includeTrialPeriod = !record.stripeSubscriptionId && trialDays > 0;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    client_reference_id: record.organizationId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      trayloop_org_id: record.organizationId,
      trayloop_billing: 'true',
    },
    subscription_data: {
      metadata: {
        trayloop_org_id: record.organizationId,
        trayloop_org_slug: record.organizationSlug,
      },
      ...(includeTrialPeriod ? { trial_period_days: trialDays } : {}),
    },
  });

  logger.info('Stripe subscription checkout session created', {
    organizationId: record.organizationId,
    stripeCustomerId,
    checkoutSessionId: session.id,
    eligibleForTrial: includeTrialPeriod,
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
}

export async function getSubscription(orgId: string) {
  const record = await getBillingRecord(orgId);
  return buildSubscriptionResponse(record);
}

export async function createPortalSession(orgId: string, input: BillingPortalInput) {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  const record = await getBillingRecord(orgId);
  if (!record.stripeCustomerId) {
    throw new ValidationError('No Stripe billing customer exists for this merchant yet.');
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: record.stripeCustomerId,
    return_url: buildPortalReturnUrl(input),
  });

  logger.info('Stripe billing portal session created', {
    organizationId: record.organizationId,
    stripeCustomerId: record.stripeCustomerId,
  });

  return {
    url: session.url,
  };
}

export { PLAN_AMOUNT_CENTS, PLAN_INTERVAL, PLAN_NAME };
