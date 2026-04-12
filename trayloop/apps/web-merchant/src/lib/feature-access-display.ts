import type { FeatureKey, PlanKey } from '@trayloop/types/plan-access';
import { getFeatureLabel, getMerchantPlanDisplay } from './plan-copy';

type FeatureUpgradeInput = {
  upgradePlan: PlanKey | null;
};

type LockedFeaturePresentationInput = {
  featureKey: FeatureKey;
  currentPlan: PlanKey | null;
  enabled: boolean;
  included: boolean;
  requiredPlan: PlanKey | null;
  upgradePlan: PlanKey | null;
  ctaHref?: string;
  ctaLabel?: string;
};

export function getFeatureUpgradeCta(input: FeatureUpgradeInput) {
  const upgradeDisplay = input.upgradePlan ? getMerchantPlanDisplay(input.upgradePlan) : null;

  return {
    href: input.upgradePlan ? `/billing?upgrade=${input.upgradePlan}` : '/billing',
    label: upgradeDisplay ? `Upgrade to ${upgradeDisplay.label}` : 'View billing',
  };
}

export function getLockedFeaturePresentation(input: LockedFeaturePresentationInput) {
  const currentPlanDisplay = getMerchantPlanDisplay(input.currentPlan);
  const requiredPlanDisplay = getMerchantPlanDisplay(input.requiredPlan);
  const upgradePlanDisplay = getMerchantPlanDisplay(input.upgradePlan);
  const upgradeCta = getFeatureUpgradeCta({
    upgradePlan: input.upgradePlan,
  });
  const availabilityLabel = input.enabled
    ? 'Included'
    : input.included
      ? 'Available on your plan'
      : 'Locked';
  const availabilityDetail = input.enabled
    ? 'This feature is already active in the merchant dashboard.'
    : requiredPlanDisplay
      ? `Unlocks on ${requiredPlanDisplay.label}.`
      : 'Unlock this add-on from billing.';

  return {
    currentPlanLabel: currentPlanDisplay?.label ?? null,
    featureLabel: getFeatureLabel(input.featureKey),
    availabilityLabel,
    availabilityDetail,
    unlocksOnLabel: requiredPlanDisplay?.label ?? upgradePlanDisplay?.label ?? 'Billing add-on',
    ctaHref: input.ctaHref ?? upgradeCta.href,
    ctaLabel: input.ctaLabel ?? upgradeCta.label,
  };
}
