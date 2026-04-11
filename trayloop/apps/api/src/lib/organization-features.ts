import { db, organizationFeatures } from '@trayloop/database';
import {
  FEATURE_KEYS,
  PLAN_DEFINITIONS,
  type BillingCycleKey,
  type FeatureKey,
  type PlanKey,
  getPlanFeatures,
} from '@trayloop/types';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';
import {
  type ResolvedFeatureAccess,
  type ResolvedFeatureMap,
  getMinimumPlanForFeature,
  normalizeBillingCycle,
  normalizePlanKey,
  resolveUpgradePlan,
} from './plan-access.js';
import { getGrowthAdvisorPriceId } from './stripe.js';

export const GROWTH_ADVISOR_FEATURE_KEY = 'growth_advisor' as const;
export const GROWTH_ADVISOR_PRICE_CENTS = 9900;
export const GROWTH_ADVISOR_INTERVAL = 'month' as const;

export type FeatureAccessState = ResolvedFeatureAccess;

export interface OrganizationFeatureEntitlements {
  currentPlan: PlanKey;
  billingCycle: BillingCycleKey;
  includedFeatures: readonly FeatureKey[];
  byKey: ResolvedFeatureMap;
  growthAdvisor: FeatureAccessState;
}

function buildBaseFeatureState(currentPlan: PlanKey, featureKey: FeatureKey): FeatureAccessState {
  const requiredPlan = getMinimumPlanForFeature(featureKey);
  const upgradeToPlan = resolveUpgradePlan(currentPlan, featureKey);

  return {
    key: featureKey,
    included: getPlanFeatures(currentPlan).includes(featureKey),
    enabled: getPlanFeatures(currentPlan).includes(featureKey),
    source: getPlanFeatures(currentPlan).includes(featureKey) ? 'plan' : null,
    requiredPlan,
    upgradeToPlan,
    stripePriceId: null,
    stripeSubscriptionItemId: null,
    available: upgradeToPlan !== null,
    priceCents: upgradeToPlan ? PLAN_DEFINITIONS[upgradeToPlan].monthlyPriceCents : null,
    interval: upgradeToPlan ? 'month' : null,
  };
}

function buildGrowthAdvisorState(): FeatureAccessState {
  return {
    key: GROWTH_ADVISOR_FEATURE_KEY,
    included: false,
    enabled: false,
    source: null,
    requiredPlan: null,
    upgradeToPlan: null,
    stripePriceId: null,
    stripeSubscriptionItemId: null,
    available: Boolean(getGrowthAdvisorPriceId()),
    priceCents: GROWTH_ADVISOR_PRICE_CENTS,
    interval: GROWTH_ADVISOR_INTERVAL,
  };
}

function buildFeatureMap(currentPlan: PlanKey): ResolvedFeatureMap {
  return FEATURE_KEYS.reduce<ResolvedFeatureMap>((accumulator, featureKey) => {
    accumulator[featureKey] =
      featureKey === GROWTH_ADVISOR_FEATURE_KEY
        ? buildGrowthAdvisorState()
        : buildBaseFeatureState(currentPlan, featureKey);

    return accumulator;
  }, {} as ResolvedFeatureMap);
}

export async function getOrganizationFeatureEntitlements(orgId: string): Promise<OrganizationFeatureEntitlements> {
  // PAS-1 keeps runtime behavior aligned with the current single-plan product until
  // the billing migration in PAS-2/PAS-4 wires real plan data into production reads.
  const currentPlan = normalizePlanKey('pro');
  const billingCycle = normalizeBillingCycle('monthly');

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

  const byKey = buildFeatureMap(currentPlan);

  for (const row of rows) {
    const current = byKey[row.featureKey];

    if (!current) {
      continue;
    }

    const enabled = current.included || row.enabled;

    byKey[row.featureKey] = {
      ...current,
      enabled,
      source: current.included ? 'plan' : (row.source ?? current.source),
      stripePriceId: row.stripePriceId,
      stripeSubscriptionItemId: row.stripeSubscriptionItemId,
      available:
        row.featureKey === GROWTH_ADVISOR_FEATURE_KEY
          ? Boolean(getGrowthAdvisorPriceId())
          : !enabled && current.upgradeToPlan !== null,
    };
  }

  return {
    currentPlan,
    billingCycle,
    includedFeatures: getPlanFeatures(currentPlan),
    byKey,
    growthAdvisor: byKey.growth_advisor,
  };
}

export async function canAccessFeature(orgId: string, featureKey: FeatureKey) {
  const entitlements = await getOrganizationFeatureEntitlements(orgId);
  return entitlements.byKey[featureKey]?.enabled ?? false;
}

export async function isGrowthAdvisorEnabledForOrganization(orgId: string) {
  return canAccessFeature(orgId, GROWTH_ADVISOR_FEATURE_KEY);
}

async function upsertSubscriptionFeatureState(input: {
  organizationId: string;
  featureKey: FeatureKey;
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
