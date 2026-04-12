import assert from 'node:assert/strict';
import { getFeatureUpgradeCta, getLockedFeaturePresentation } from './feature-access-display';

function runTest(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

runTest('Launch recurring lock points merchants to Momentum', () => {
  const cta = getFeatureUpgradeCta({ upgradePlan: 'pro' });
  assert.equal(cta.href, '/billing?upgrade=pro');
  assert.equal(cta.label, 'Upgrade to Momentum');

  const presentation = getLockedFeaturePresentation({
    featureKey: 'orders.recurring_schedule',
    currentPlan: 'starter',
    enabled: false,
    included: false,
    requiredPlan: 'pro',
    upgradePlan: 'pro',
  });

  assert.equal(presentation.featureLabel, 'Recurring schedules');
  assert.equal(presentation.availabilityLabel, 'Locked');
  assert.equal(presentation.unlocksOnLabel, 'Momentum');
  assert.equal(presentation.ctaHref, '/billing?upgrade=pro');
  assert.equal(presentation.ctaLabel, 'Upgrade to Momentum');
});

runTest('Momentum AI campaign lock points merchants to Engine', () => {
  const presentation = getLockedFeaturePresentation({
    featureKey: 'campaigns.ai_email',
    currentPlan: 'pro',
    enabled: false,
    included: false,
    requiredPlan: 'growth',
    upgradePlan: 'growth',
  });

  assert.equal(presentation.featureLabel, 'AI email campaigns');
  assert.equal(presentation.availabilityDetail, 'Unlocks on Engine.');
  assert.equal(presentation.ctaHref, '/billing?upgrade=growth');
  assert.equal(presentation.ctaLabel, 'Upgrade to Engine');
});

runTest('already enabled features present as included instead of locked', () => {
  const presentation = getLockedFeaturePresentation({
    featureKey: 'analytics.advanced',
    currentPlan: 'growth',
    enabled: true,
    included: true,
    requiredPlan: null,
    upgradePlan: null,
  });

  assert.equal(presentation.availabilityLabel, 'Included');
  assert.equal(presentation.currentPlanLabel, 'Engine');
  assert.equal(presentation.ctaHref, '/billing');
  assert.equal(presentation.ctaLabel, 'View billing');
});
