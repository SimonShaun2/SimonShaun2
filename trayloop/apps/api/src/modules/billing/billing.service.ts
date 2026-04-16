import { db, organizations, subscriptions, users } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { ValidationError } from '../../lib/errors.js';
import {
  getPlanForStripePriceId,
  getConfiguredSharedEntitlementPriceIds,
  getStripe,
  getSharedEntitlementPriceId,
  getSubscriptionPriceId,
  getSubscriptionTrialDays,
  isStripeEnabled,
} from '../../lib/stripe.js';
import { getOrganizationFeatureEntitlements, syncSubscriptionFeatureEntitlements } from '../../lib/organization-features.js';
import { logger } from '@trayloop/utils';
import type { BillingCheckoutInput, BillingPortalInput } from './billing.schema.js';
import Stripe from 'stripe';
import {
  PLAN_DEFINITIONS,
  type BillingCycleKey,
  type PlanKey,
} from '@trayloop/types';
import {
  SHARED_ENTITLEMENT_DEFINITIONS,
  type SharedEntitlementKey,
} from '@trayloop/types';

type BillingState = 'not_started' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
type LocalSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

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

function safeDate(value: unknown): Date | null {
  if (typeof value === 'number' && value > 0) return new Date(value * 1000);
  return null;
}

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

function getIntervalLabel(billingCycle: BillingCycleKey) {
  return billingCycle === 'annual' ? 'year' : 'month';
}

function getPlanDisplay(plan: PlanKey, billingCycle: BillingCycleKey) {
  const definition = PLAN_DEFINITIONS[plan];

  return {
    name: definition.label,
    priceCents: definition.monthlyPriceCents,
    interval: getIntervalLabel(billingCycle),
  };
}

function resolveCheckoutSharedEntitlements(input: BillingCheckoutInput): SharedEntitlementKey[] {
  const selected = new Set<SharedEntitlementKey>(input.addOns ?? []);

  if (input.includeGrowthAdvisor) {
    selected.add('growth_advisor');
  }

  return [...selected];
}

function getSharedEntitlementLineItems(sharedEntitlementKeys: SharedEntitlementKey[]) {
  return sharedEntitlementKeys.map((entitlementKey) => {
    const priceId = getSharedEntitlementPriceId(entitlementKey);

    if (!priceId) {
      const label = SHARED_ENTITLEMENT_DEFINITIONS[entitlementKey].label;
      throw new ValidationError(
        `${label} add-on is not configured yet. Set the matching Stripe price ID before selling it.`,
      );
    }

    return {
      entitlementKey,
      priceId,
    };
  });
}

function resolvePersistedPlan(input: {
  stripePriceId: string | null | undefined;
}) {
  return getPlanForStripePriceId(input.stripePriceId) ?? 'starter';
}

function resolvePersistedBillingCycle(): BillingCycleKey {
  return 'monthly';
}

function getBasePlanItem(subscription: Pick<Stripe.Subscription, 'items'>) {
  return subscription.items.data.find((item) => {
    const priceId = typeof item.price === 'string' ? item.price : item.price?.id ?? null;
    return getPlanForStripePriceId(priceId) !== null;
  }) ?? null;
}

function resolvePlanStateFromSubscription(
  subscription: Pick<Stripe.Subscription, 'items'>,
  fallbackPlan: PlanKey,
  fallbackCycle: BillingCycleKey,
) {
  const basePlanItem = getBasePlanItem(subscription);
  const basePlanPriceId =
    typeof basePlanItem?.price === 'string'
      ? basePlanItem.price
      : basePlanItem?.price?.id ?? null;
  const plan = getPlanForStripePriceId(basePlanPriceId) ?? fallbackPlan;

  return {
    plan,
    billingCycle: fallbackCycle,
    basePlanItem,
    basePlanPriceId,
  };
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

async function syncSubscriptionSnapshot(
  orgId: string,
  stripeCustomerId: string,
  subscription: Stripe.Subscription,
  fallbackPlan: PlanKey = 'starter',
  fallbackCycle: BillingCycleKey = 'monthly',
) {
  const resolvedPlan = resolvePlanStateFromSubscription(subscription, fallbackPlan, fallbackCycle);
  const primaryItem = resolvedPlan.basePlanItem ?? subscription.items.data[0];
  const rawPeriodStart = subscription.current_period_start ?? (primaryItem as any)?.current_period_start ?? null;
  const rawPeriodEnd = subscription.current_period_end ?? (primaryItem as any)?.current_period_end ?? null;
  const currentPeriodStart = typeof rawPeriodStart === 'number' ? new Date(rawPeriodStart * 1000) : null;
  const currentPeriodEnd = typeof rawPeriodEnd === 'number' ? new Date(rawPeriodEnd * 1000) : null;

  await db
    .insert(subscriptions)
    .values({
      organizationId: orgId,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: resolvedPlan.basePlanPriceId,
      status: normalizeSubscriptionStatus(subscription.status),
      trialStart: safeDate(subscription.trial_start),
      trialEnd: safeDate(subscription.trial_end),
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt: safeDate(subscription.canceled_at),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: resolvedPlan.basePlanPriceId,
        status: normalizeSubscriptionStatus(subscription.status),
        trialStart: safeDate(subscription.trial_start),
        trialEnd: safeDate(subscription.trial_end),
        currentPeriodStart,
        currentPeriodEnd,
        canceledAt: safeDate(subscription.canceled_at),
        updatedAt: new Date(),
      },
    });

  await syncSubscriptionFeatureEntitlements(orgId, subscription);
}

async function syncSubscriptionFromStripe(record: Awaited<ReturnType<typeof getBillingRecord>>) {
  if (!isStripeEnabled() || !record.stripeCustomerId) {
    return record;
  }

  try {
    const stripe = getStripe();

    const subscription =
      record.stripeSubscriptionId
        ? await stripe.subscriptions.retrieve(record.stripeSubscriptionId)
        : (await stripe.subscriptions.list({
            customer: record.stripeCustomerId,
            status: 'all',
            limit: 1,
          })).data[0] ?? null;

    if (!subscription) {
      return record;
    }

    await syncSubscriptionSnapshot(
      record.organizationId,
      record.stripeCustomerId,
      subscription,
      resolvePersistedPlan({ stripePriceId: record.stripePriceId }),
      resolvePersistedBillingCycle(),
    );

    logger.info('Subscription snapshot refreshed from Stripe on read', {
      organizationId: record.organizationId,
      stripeCustomerId: record.stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
    });

    return getBillingRecord(record.organizationId);
  } catch (error) {
    logger.warn('Subscription refresh from Stripe failed; using persisted snapshot', {
      organizationId: record.organizationId,
      stripeCustomerId: record.stripeCustomerId,
      stripeSubscriptionId: record.stripeSubscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return record;
  }
}

async function buildSubscriptionResponse(record: Awaited<ReturnType<typeof getBillingRecord>>) {
  const state = mapSubscriptionStatus(record.status);
  const trialDaysRemaining = getTrialDaysRemaining(record.trialEnd);
  const hasStripeCustomer = Boolean(record.stripeCustomerId);
  const features = await getOrganizationFeatureEntitlements(record.organizationId);
  const planDisplay = getPlanDisplay(features.currentPlan, features.billingCycle);

  return {
    organizationId: record.organizationId,
    organizationName: record.organizationName,
    currentPlan: features.currentPlan,
    billingCycle: features.billingCycle,
    planName: planDisplay.name,
    priceCents: planDisplay.priceCents,
    interval: planDisplay.interval,
    state,
    canCheckout: state === 'not_started' || state === 'canceled',
    canManage: hasStripeCustomer && state !== 'not_started',
    trialDaysRemaining,
    features,
    subscription: record.subscriptionId
      ? {
          id: record.subscriptionId,
          stripeCustomerId: record.stripeCustomerId,
          stripeSubscriptionId: record.stripeSubscriptionId,
          stripePriceId: record.stripePriceId,
          plan: resolvePersistedPlan({ stripePriceId: record.stripePriceId }),
          billingCycle: resolvePersistedBillingCycle(),
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

async function getStripeSubscriptionForRecord(record: Awaited<ReturnType<typeof getBillingRecord>>) {
  if (!record.stripeCustomerId) {
    throw new ValidationError('Start a TrayLoop plan subscription before adding Growth Advisor.');
  }

  const stripe = getStripe();
  const subscription =
    record.stripeSubscriptionId
      ? await stripe.subscriptions.retrieve(record.stripeSubscriptionId)
      : (await stripe.subscriptions.list({
          customer: record.stripeCustomerId,
          status: 'all',
          limit: 1,
        })).data[0] ?? null;

  if (!subscription) {
    throw new ValidationError('Start a TrayLoop plan subscription before adding Growth Advisor.');
  }

  return subscription;
}

async function updateBasePlanOnExistingSubscription(
  record: Awaited<ReturnType<typeof getBillingRecord>>,
  input: BillingCheckoutInput,
  targetPlan: PlanKey,
  sharedEntitlementKeys: SharedEntitlementKey[],
) {
  const subscription = await getStripeSubscriptionForRecord(record);
  const fallbackPlan = resolvePersistedPlan({ stripePriceId: record.stripePriceId });
  const fallbackCycle = resolvePersistedBillingCycle();
  const resolvedCurrent = resolvePlanStateFromSubscription(subscription, fallbackPlan, fallbackCycle);
  const targetPriceId = getSubscriptionPriceId(targetPlan, resolvedCurrent.billingCycle);
  const configuredSharedEntitlementPriceIds = getConfiguredSharedEntitlementPriceIds();
  const existingSharedEntitlementPriceIds = new Set(
    subscription.items.data
      .map((item) => (typeof item.price === 'string' ? item.price : item.price?.id ?? null))
      .filter((priceId): priceId is string => Boolean(priceId)),
  );
  const sharedEntitlementLineItems = getSharedEntitlementLineItems(sharedEntitlementKeys);

  if (!resolvedCurrent.basePlanItem) {
    throw new ValidationError('The current base plan could not be identified for this subscription.');
  }

  if (
    resolvedCurrent.plan === targetPlan &&
    sharedEntitlementKeys.every((entitlementKey) => {
      const priceId = configuredSharedEntitlementPriceIds[entitlementKey];
      return priceId ? existingSharedEntitlementPriceIds.has(priceId) : false;
    })
  ) {
    await syncSubscriptionSnapshot(
      record.organizationId,
      record.stripeCustomerId!,
      subscription,
      resolvedCurrent.plan,
      resolvedCurrent.billingCycle,
    );

    throw new ValidationError(
      sharedEntitlementKeys.length > 0
        ? `${sharedEntitlementKeys.map((entitlementKey) => SHARED_ENTITLEMENT_DEFINITIONS[entitlementKey].label).join(', ')} is already included in this subscription.`
        : `${PLAN_DEFINITIONS[targetPlan].label} is already active for this merchant.`,
    );
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = [
    {
      id: resolvedCurrent.basePlanItem.id,
      price: targetPriceId,
    },
  ];

  for (const sharedEntitlement of sharedEntitlementLineItems) {
    if (existingSharedEntitlementPriceIds.has(sharedEntitlement.priceId)) {
      continue;
    }

    items.push({
      price: sharedEntitlement.priceId,
      quantity: 1,
    });
  }

  const stripe = getStripe();
  const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
    items,
    proration_behavior: 'always_invoice',
  });

  await syncSubscriptionSnapshot(
    record.organizationId,
    record.stripeCustomerId!,
    updatedSubscription,
    targetPlan,
    resolvedCurrent.billingCycle,
  );

  logger.info('Base plan updated on existing subscription', {
    organizationId: record.organizationId,
    stripeCustomerId: record.stripeCustomerId,
    stripeSubscriptionId: updatedSubscription.id,
    fromPlan: resolvedCurrent.plan,
    toPlan: targetPlan,
    sharedEntitlementKeys,
  });

  return {
    url: input.successUrl ?? `${getMerchantBaseUrl()}/billing?billing=success&plan=${targetPlan}`,
    sessionId: updatedSubscription.id,
  };
}

export async function createCheckoutSession(orgId: string, input: BillingCheckoutInput) {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  const record = await getBillingRecord(orgId);
  const persistedPlan = resolvePersistedPlan({ stripePriceId: record.stripePriceId });
  const billingCycle = resolvePersistedBillingCycle();
  const targetPlan = input.plan ?? persistedPlan;
  const priceId = getSubscriptionPriceId(targetPlan, billingCycle);
  const sharedEntitlementKeys = resolveCheckoutSharedEntitlements(input);
  const state = mapSubscriptionStatus(record.status);
  const hasActiveSubscription = state === 'active' || state === 'trialing' || state === 'past_due' || state === 'unpaid';

  if (hasActiveSubscription) {
    if (targetPlan !== persistedPlan || sharedEntitlementKeys.length > 0) {
      return updateBasePlanOnExistingSubscription(record, input, targetPlan, sharedEntitlementKeys);
    }

    throw new ValidationError('A subscription already exists for this merchant. Use manage subscription instead.');
  }

  const stripe = getStripe();
  const stripeCustomerId = record.stripeCustomerId ?? await createStripeCustomer(record);
  const { successUrl, cancelUrl } = buildCheckoutUrls(input);
  const trialDays = getSubscriptionTrialDays();
  const includeTrialPeriod = !record.stripeSubscriptionId && trialDays > 0;
  const sharedEntitlementLineItems = getSharedEntitlementLineItems(sharedEntitlementKeys);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: priceId,
      quantity: 1,
    },
  ];

  for (const sharedEntitlement of sharedEntitlementLineItems) {
    lineItems.push({
      price: sharedEntitlement.priceId,
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    client_reference_id: record.organizationId,
    allow_promotion_codes: true,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      trayloop_org_id: record.organizationId,
      trayloop_billing: 'true',
      trayloop_growth_advisor: sharedEntitlementKeys.includes('growth_advisor') ? 'true' : 'false',
      trayloop_shared_entitlements: sharedEntitlementKeys.join(','),
      trayloop_plan: targetPlan,
    },
    subscription_data: {
      metadata: {
        trayloop_org_id: record.organizationId,
        trayloop_org_slug: record.organizationSlug,
        trayloop_shared_entitlements: sharedEntitlementKeys.join(','),
        trayloop_plan: targetPlan,
      },
      ...(includeTrialPeriod ? { trial_period_days: trialDays } : {}),
    },
  });

  logger.info('Stripe subscription checkout session created', {
      organizationId: record.organizationId,
      stripeCustomerId,
      checkoutSessionId: session.id,
      plan: targetPlan,
      eligibleForTrial: includeTrialPeriod,
      sharedEntitlementKeys,
    });

  // Persist a placeholder snapshot so billing can self-heal from Stripe even
  // if webhook delivery is delayed or temporarily fails.
  await db
    .insert(subscriptions)
    .values({
      organizationId: record.organizationId,
      stripeCustomerId,
      stripePriceId: priceId,
      status: 'unpaid',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        stripeCustomerId,
        stripePriceId: priceId,
        updatedAt: new Date(),
      },
    });

  return {
    url: session.url,
    sessionId: session.id,
  };
}

export async function getSubscription(orgId: string) {
  const persisted = await getBillingRecord(orgId);
  const shouldRefreshFromStripe = Boolean(
    persisted.stripeCustomerId &&
      (
        !persisted.stripeSubscriptionId ||
        persisted.status === 'past_due' ||
        persisted.status === 'unpaid' ||
        persisted.status === 'canceled'
      ),
  );
  const record = shouldRefreshFromStripe
    ? await syncSubscriptionFromStripe(persisted)
    : persisted;
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

