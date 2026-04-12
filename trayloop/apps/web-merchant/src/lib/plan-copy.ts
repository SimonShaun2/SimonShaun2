import { getNextPlan, type FeatureKey, type PlanKey } from '@trayloop/types/src/plan-access';

export type MerchantPlanDisplay = {
  label: string;
  priceCents: number;
  description: string;
  highlights: string[];
  nextPlan: PlanKey | null;
};

export const MERCHANT_PLAN_DISPLAY: Record<PlanKey, MerchantPlanDisplay> = {
  starter: {
    label: 'Launch',
    priceCents: 2900,
    description: 'Core launch plan for taking direct catering orders and managing the first storefront setup.',
    highlights: ['Storefront basics', 'Basic order intake', 'Future scheduling', 'Deposits', 'Basic reporting'],
    nextPlan: 'pro',
  },
  pro: {
    label: 'Momentum',
    priceCents: 9900,
    description: 'Adds repeat-order workflows, customer insight, and stronger operational controls.',
    highlights: ['Recurring schedules', 'Discount rules', 'Customer insights', 'Event templates', 'Reorder tools'],
    nextPlan: 'growth',
  },
  growth: {
    label: 'Engine',
    priceCents: 14900,
    description: 'Adds AI-driven growth automation, advanced analytics, and retention tools.',
    highlights: ['AI campaigns', 'Advanced analytics', 'At-risk customer signals', 'Lead scoring', 'Growth intelligence'],
    nextPlan: getNextPlan('growth'),
  },
};

const FEATURE_LABELS: Partial<Record<FeatureKey, string>> = {
  'storefront.basic': 'Storefront basics',
  'orders.basic_intake': 'Basic order intake',
  'orders.future_schedule_basic': 'Future scheduling',
  'orders.recurring_schedule': 'Recurring schedules',
  'orders.discount_rules': 'Discount rules',
  'deposits.enabled': 'Deposits',
  'reporting.basic': 'Basic reporting',
  'reporting.advanced': 'Advanced reporting',
  'customers.basic_insights': 'Customer insights',
  'customers.segmentation': 'Customer segmentation',
  'templates.events': 'Event templates',
  'reorder.basic': 'Reorder tools',
  'upsells.basic': 'Upsells',
  'upsells.ai': 'AI upsells',
  'campaigns.ai_email': 'AI email campaigns',
  'campaigns.ai_sms': 'AI SMS campaigns',
  'campaigns.reactivation': 'Reactivation campaigns',
  'ai.lead_scoring': 'Lead scoring',
  'analytics.advanced': 'Advanced analytics',
  'analytics.at_risk_customers': 'At-risk customer signals',
  'analytics.customer_ltv': 'Customer lifetime value',
  'growth.corporate_insights': 'Corporate insights',
  'growth_advisor': 'Growth Advisor',
};

export function getMerchantPlanDisplay(plan: PlanKey | null) {
  return plan ? MERCHANT_PLAN_DISPLAY[plan] : null;
}

export function getMerchantPlanLabel(plan: PlanKey | null) {
  return getMerchantPlanDisplay(plan)?.label ?? 'Launch';
}

export function getMerchantPlanPrice(plan: PlanKey | null) {
  return getMerchantPlanDisplay(plan)?.priceCents ?? 0;
}

export function getMerchantPlanPriceLabel(plan: PlanKey | null) {
  const display = getMerchantPlanDisplay(plan);
  if (!display) return '$0';
  return `$${(display.priceCents / 100).toFixed(0)}/mo`;
}

export function getFeatureLabel(featureKey: FeatureKey) {
  return FEATURE_LABELS[featureKey] ?? featureKey;
}
