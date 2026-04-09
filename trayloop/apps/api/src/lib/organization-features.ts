import { db, organizationFeatures } from '@trayloop/database';
import { and, eq } from 'drizzle-orm';
import type Stripe from 'stripe';
import { getGrowthAdvisorPriceId } from './stripe.js';

export const GROWTH_ADVISOR_FEATURE_KEY = 'growth_advisor' as const;
export const GROWTH_ADVISOR_PRICE_CENTS = 9900;
export const GROWTH_ADVISOR_INTERVAL = 'month' as const;

export interface FeatureAccessState {
  enabled: boolean;
  source: string | null;
  stripePriceId: string | null;
  stripeSubscriptionItemId: string | null;
  available: boolean;
  priceCents: number;
  interval: typeof GROWTH_ADVISOR_INTERVAL;
}

export interface OrganizationFeatureEntitlements {
  growthAdvisor: FeatureAccessState;
}

function buildDisabledFeatureState(): FeatureAccessState {
  return {
    enabled: false,
    source: null,
    stripePriceId: null,
    stripeSubscriptionItemId: null,
    available: Boolean(getGrowthAdvisorPriceId()),
    priceCents: GROWTH_ADVISOR_PRICE_CENTS,
    interval: GROWTH_ADVISOR_INTERVAL,
  };
}

export async function getOrganizationFeatureEntitlements(orgId: string): Promise<OrganizationFeatureEntitlements> {
  const rows = await db
    .select({
      featureKey: organizationFeatures.featureKey,
      enabled: organizationFeatures.enabled,
      source: organizationFeatures.source,
      stripePriceId: organizationFeatures.stripePriceId,
      stripeSubscriptionItemId: organizationFeatures.stripeSubscriptionItemId,
    })
    .from(organizationFeatures)
    .where(eq(organizationFeatures.organizationId, orgId));

  const growthAdvisor = buildDisabledFeatureState();
  const growthAdvisorRow = rows.find((row) => row.featureKey === GROWTH_ADVISOR_FEATURE_KEY);

  if (growthAdvisorRow) {
    growthAdvisor.enabled = growthAdvisorRow.enabled;
    growthAdvisor.source = growthAdvisorRow.source;
    growthAdvisor.stripePriceId = growthAdvisorRow.stripePriceId;
    growthAdvisor.stripeSubscriptionItemId = growthAdvisorRow.stripeSubscriptionItemId;
  }

  return { growthAdvisor };
}

export async function isGrowthAdvisorEnabledForOrganization(orgId: string) {
  const entitlements = await getOrganizationFeatureEntitlements(orgId);
  return entitlements.growthAdvisor.enabled;
}

async function upsertSubscriptionFeatureState(input: {
  organizationId: string;
  featureKey: typeof GROWTH_ADVISOR_FEATURE_KEY;
  enabled: boolean;
  stripePriceId: string | null;
  stripeSubscriptionItemId: string | null;
}) {
  await db
    .insert(organizationFeatures)
    .values({
      organizationId: input.organizationId,
      featureKey: input.featureKey,
      enabled: input.enabled,
      source: 'subscription',
      stripePriceId: input.stripePriceId,
      stripeSubscriptionItemId: input.stripeSubscriptionItemId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [organizationFeatures.organizationId, organizationFeatures.featureKey],
      set: {
        enabled: input.enabled,
        source: 'subscription',
        stripePriceId: input.stripePriceId,
        stripeSubscriptionItemId: input.stripeSubscriptionItemId,
        updatedAt: new Date(),
      },
    });
}

export async function syncSubscriptionFeatureEntitlements(
  organizationId: string,
  subscription: Pick<Stripe.Subscription, 'status' | 'items'>,
) {
  const growthAdvisorPriceId = getGrowthAdvisorPriceId();
  const subscriptionIsActive = subscription.status !== 'canceled' && subscription.status !== 'incomplete_expired';

  if (!growthAdvisorPriceId) {
    await upsertSubscriptionFeatureState({
      organizationId,
      featureKey: GROWTH_ADVISOR_FEATURE_KEY,
      enabled: false,
      stripePriceId: null,
      stripeSubscriptionItemId: null,
    });
    return;
  }

  const matchingItem = subscription.items.data.find((item) => item.price?.id === growthAdvisorPriceId);

  await upsertSubscriptionFeatureState({
    organizationId,
    featureKey: GROWTH_ADVISOR_FEATURE_KEY,
    enabled: Boolean(matchingItem && subscriptionIsActive),
    stripePriceId: matchingItem?.price?.id ?? growthAdvisorPriceId,
    stripeSubscriptionItemId: matchingItem?.id ?? null,
  });
}
