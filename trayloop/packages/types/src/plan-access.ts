export const PLAN_KEYS = ['starter', 'pro', 'growth'] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export const BILLING_CYCLE_KEYS = ['monthly', 'annual'] as const;

export type BillingCycleKey = (typeof BILLING_CYCLE_KEYS)[number];

export const ENTITLEMENT_SOURCE_KEYS = [
  'plan',
  'subscription',
  'add_on',
  'promo',
  'trial',
  'manual',
] as const;

export type EntitlementSourceKey = (typeof ENTITLEMENT_SOURCE_KEYS)[number];

export const SHARED_ENTITLEMENT_KEYS = ['growth_advisor'] as const;

export type SharedEntitlementKey = (typeof SHARED_ENTITLEMENT_KEYS)[number];

export const FEATURE_KEYS = [
  'storefront.basic',
  'orders.basic_intake',
  'orders.future_schedule_basic',
  'orders.recurring_schedule',
  'orders.discount_rules',
  'deposits.enabled',
  'reporting.basic',
  'reporting.advanced',
  'customers.basic_insights',
  'customers.segmentation',
  'templates.events',
  'reorder.basic',
  'upsells.basic',
  'upsells.ai',
  'campaigns.ai_email',
  'campaigns.ai_sms',
  'campaigns.reactivation',
  'ai.lead_scoring',
  'analytics.advanced',
  'analytics.at_risk_customers',
  'analytics.customer_ltv',
  'growth.corporate_insights',
  'growth_advisor',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface SharedEntitlementDefinition {
  key: SharedEntitlementKey;
  label: string;
  description: string;
  monthlyPriceCents: number;
  interval: 'month';
}

export interface PlanDefinition {
  key: PlanKey;
  label: string;
  monthlyPriceCents: number;
  description: string;
}

export const PLAN_DEFINITIONS: Record<PlanKey, PlanDefinition> = {
  starter: {
    key: 'starter',
    label: 'Launch',
    monthlyPriceCents: 2900,
    description: 'Core infrastructure for direct catering orders.',
  },
  pro: {
    key: 'pro',
    label: 'Momentum',
    monthlyPriceCents: 9900,
    description: 'Recurring ordering and operational optimization tools.',
  },
  growth: {
    key: 'growth',
    label: 'Engine',
    monthlyPriceCents: 14900,
    description: 'AI-driven repeat revenue, campaigns, and growth intelligence.',
  },
};

export const SHARED_ENTITLEMENT_DEFINITIONS: Record<SharedEntitlementKey, SharedEntitlementDefinition> = {
  growth_advisor: {
    key: 'growth_advisor',
    label: 'Growth Advisor',
    description: 'AI growth guidance and launch planning.',
    monthlyPriceCents: 9900,
    interval: 'month',
  },
};

export const PLAN_FEATURES: Record<PlanKey, readonly FeatureKey[]> = {
  starter: [
    'storefront.basic',
    'orders.basic_intake',
    'orders.future_schedule_basic',
    'deposits.enabled',
    'reporting.basic',
    'upsells.basic',
  ],
  pro: [
    'storefront.basic',
    'orders.basic_intake',
    'orders.future_schedule_basic',
    'orders.recurring_schedule',
    'orders.discount_rules',
    'deposits.enabled',
    'reporting.basic',
    'customers.basic_insights',
    'templates.events',
    'reorder.basic',
    'upsells.basic',
  ],
  growth: FEATURE_KEYS.filter((featureKey) => featureKey !== 'growth_advisor'),
};

export function getPlanDefinition(plan: PlanKey): PlanDefinition {
  return PLAN_DEFINITIONS[plan];
}

export function getPlanFeatures(plan: PlanKey): readonly FeatureKey[] {
  return PLAN_FEATURES[plan];
}

export function getNextPlan(plan: PlanKey): PlanKey | null {
  if (plan === 'starter') return 'pro';
  if (plan === 'pro') return 'growth';
  return null;
}

export function planIncludesFeature(plan: PlanKey, featureKey: FeatureKey) {
  return PLAN_FEATURES[plan].includes(featureKey);
}

export function getSharedEntitlementDefinition(key: SharedEntitlementKey): SharedEntitlementDefinition {
  return SHARED_ENTITLEMENT_DEFINITIONS[key];
}
