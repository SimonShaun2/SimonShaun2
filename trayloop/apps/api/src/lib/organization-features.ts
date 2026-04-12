import { db, organizationFeatures, subscriptions } from '@trayloop/database';
import {
  FEATURE_KEYS,
  PLAN_DEFINITIONS,
  type BillingCycleKey,
  type FeatureKey,
  type PlanKey,
  getPlanFeatures,
} from '@trayloop/types';
import {
  SHARED_ENTITLEMENT_DEFINITIONS,
  SHARED_ENTITLEMENT_KEYS,
  type EntitlementSourceKey,
  type SharedEntitlementKey,
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
import { getConfiguredSharedEntitlementPriceIds, getPlanForStripePriceId } from './stripe.js';

export const GROWTH_ADVISOR_FEATURE_KEY = 'growth_advisor' as const;

export type FeatureAccessState = ResolvedFeatureAccess;

export interface OrganizationFeatureEntitlements {
  currentPlan: PlanKey;
  billingCycle: BillingCycleKey;
  includedFeatures: readonly FeatureKey[];
  byKey: ResolvedFeatureMap;
  growthAdvisor: FeatureAccessState;
}

const SHARED_ENTITLEMENT_KEY_SET = new Set<SharedEntitlementKey>(SHARED_ENTITLEMENT_KEYS);

function buildBaseFeatureState(currentPlan: PlanKey, featureKey: FeatureKey): FeatureAccessState {
  const requiredPlan = getMinimumPlanForFeature(featureKey);
  const upgradeToPlan = resolveUpgradePlan(currentPlan, featureKey);

  return {
    key: featureKey,
    kind: 'plan_feature',
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

function buildSharedEntitlementState(entitlementKey: SharedEntitlementKey): FeatureAccessState {
  const definition = SHARED_ENTITLEMENT_DEFINITIONS[entitlementKey];
  const configuredPriceIds = getConfiguredSharedEntitlementPriceIds();

  return {
    key: entitlementKey,
    kind: 'shared_add_on',
    included: false,
    enabled: false,
    source: null,
    requiredPlan: null,
    upgradeToPlan: null,
    stripePriceId: null,
    stripeSubscriptionItemId: null,
    available: Boolean(configuredPriceIds[entitlementKey]),
    priceCents: definition.monthlyPriceCents,
    interval: definition.interval,
  };
}

function buildFeatureMap(currentPlan: PlanKey): ResolvedFeatureMap {
  return FEATURE_KEYS.reduce<ResolvedFeatureMap>((accumulator, featureKey) => {
    accumulator[featureKey] =
      SHARED_ENTITLEMENT_KEY_SET.has(featureKey as SharedEntitlementKey)
        ? buildSharedEntitlementState(featureKey as SharedEntitlementKey)
        : buildBaseFeatureState(currentPlan, featureKey);

    return accumulator;
  }, {} as ResolvedFeatureMap);
}

async function getOrganizationPlanState(orgId: string) {
  const [record] = await db
    .select({
      stripePriceId: subscriptions.stripePriceId,
    })
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  const currentPlan = normalizePlanKey(getPlanForStripePriceId(record?.stripePriceId) ?? 'starter');
  const billingCycle = normalizeBillingCycle('monthly');

  return {
    currentPlan,
    billingCycle,
  };
}

export async function getOrganizationFeatureEntitlements(orgId: string): Promise<OrganizationFeatureEntitlements> {
  const { currentPlan, billingCycle } = await getOrganizationPlanState(orgId);

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
  const configuredSharedEntitlementPriceIds = getConfiguredSharedEntitlementPriceIds();

  for (const row of rows) {
    const current = byKey[row.featureKey];

    if (!current) {
      continue;
    }

    const isSharedEntitlement = SHARED_ENTITLEMENT_KEY_SET.has(row.featureKey as SharedEntitlementKey);
    const configuredPriceId = isSharedEntitlement
      ? configuredSharedEntitlementPriceIds[row.featureKey as SharedEntitlementKey]
      : null;
    const enabled = current.included || row.enabled;
    const source = (row.source ?? current.source ?? null) as EntitlementSourceKey | null;

    byKey[row.featureKey] = {
      ...current,
      kind: isSharedEntitlement ? 'shared_add_on' : 'plan_feature',
      enabled,
      source: current.included ? 'plan' : source,
      stripePriceId: row.stripePriceId ?? configuredPriceId,
      stripeSubscriptionItemId: row.stripeSubscriptionItemId,
      available:
        current.included
          ? false
          : isSharedEntitlement
            ? enabled || Boolean(row.stripePriceId ?? configuredPriceId)
            : current.upgradeToPlan !== null,
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
  source: EntitlementSourceKey;
  stripePriceId: string | null;
  stripeSubscriptionItemId: string | null;
}) {
  await db
    .insert(organizationFeatures)
    .values({
      organizationId: input.organizationId,
      featureKey: input.featureKey,
      enabled: input.enabled,
      source: input.source,
      stripePriceId: input.stripePriceId,
      stripeSubscriptionItemId: input.stripeSubscriptionItemId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [organizationFeatures.organizationId, organizationFeatures.featureKey],
      set: {
        enabled: input.enabled,
        source: input.source,
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
  const subscriptionIsActive = subscription.status !== 'canceled' && subscription.status !== 'incomplete_expired';
  const configuredSharedEntitlementPriceIds = getConfiguredSharedEntitlementPriceIds();

  for (const entitlementKey of SHARED_ENTITLEMENT_KEYS) {
    const configuredPriceId = configuredSharedEntitlementPriceIds[entitlementKey];
    const matchingItem = configuredPriceId
      ? subscription.items.data.find((item) => item.price?.id === configuredPriceId)
      : null;
    const source: EntitlementSourceKey = matchingItem
      ? subscription.status === 'trialing'
        ? 'trial'
        : 'add_on'
      : 'manual';

    await upsertSubscriptionFeatureState({
      organizationId,
      featureKey: entitlementKey,
      enabled: Boolean(matchingItem && subscriptionIsActive),
      source,
      stripePriceId: matchingItem?.price?.id ?? configuredPriceId ?? null,
      stripeSubscriptionItemId: matchingItem?.id ?? null,
    });
  }
}
