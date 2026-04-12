import {
  FEATURE_KEYS,
  PLAN_DEFINITIONS,
  type BillingCycleKey,
  type FeatureKey,
  type PlanDefinition,
  type PlanKey,
  getNextPlan,
  getPlanDefinition,
  getPlanFeatures,
  planIncludesFeature,
} from '@trayloop/types';
import type { EntitlementSourceKey } from '@trayloop/types';

export interface ResolvedFeatureAccess {
  key: FeatureKey;
  kind: 'plan_feature' | 'shared_add_on';
  enabled: boolean;
  included: boolean;
  source: EntitlementSourceKey | null;
  requiredPlan: PlanKey | null;
  upgradeToPlan: PlanKey | null;
  stripePriceId: string | null;
  stripeSubscriptionItemId: string | null;
  available: boolean;
  priceCents: number | null;
  interval: 'month' | null;
}

export type ResolvedFeatureMap = Record<FeatureKey, ResolvedFeatureAccess>;

export function getMinimumPlanForFeature(featureKey: FeatureKey): PlanKey | null {
  for (const plan of Object.keys(PLAN_DEFINITIONS) as PlanKey[]) {
    if (planIncludesFeature(plan, featureKey)) {
      return plan;
    }
  }

  return null;
}

export function buildPlanFeatureAvailability(plan: PlanKey) {
  return FEATURE_KEYS.reduce<Record<FeatureKey, boolean>>((accumulator, featureKey) => {
    accumulator[featureKey] = planIncludesFeature(plan, featureKey);
    return accumulator;
  }, {} as Record<FeatureKey, boolean>);
}

export function resolveUpgradePlan(currentPlan: PlanKey, featureKey: FeatureKey): PlanKey | null {
  const minimumPlan = getMinimumPlanForFeature(featureKey);

  if (!minimumPlan || planIncludesFeature(currentPlan, featureKey)) {
    return null;
  }

  return minimumPlan;
}

export function getPlanCatalog(): Record<PlanKey, PlanDefinition> {
  return PLAN_DEFINITIONS;
}

export function getResolvedPlanDefinition(plan: PlanKey) {
  return getPlanDefinition(plan);
}

export function getResolvedPlanFeatures(plan: PlanKey) {
  return getPlanFeatures(plan);
}

export function normalizeBillingCycle(value: string | null | undefined): BillingCycleKey {
  return value === 'annual' ? 'annual' : 'monthly';
}

export function normalizePlanKey(value: string | null | undefined): PlanKey {
  if (value === 'starter' || value === 'pro' || value === 'growth') {
    return value;
  }

  return 'starter';
}

export function getUpgradeTarget(currentPlan: PlanKey): PlanKey | null {
  return getNextPlan(currentPlan);
}
