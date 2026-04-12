import assert from 'node:assert/strict';
import {
  FEATURE_KEYS,
  PLAN_DEFINITIONS,
  getNextPlan,
  getPlanFeatures,
  getSharedEntitlementDefinition,
  planIncludesFeature,
} from './plan-access.js';

function runTest(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

runTest('Launch, Momentum, and Engine expose the expected public pricing', () => {
  assert.equal(PLAN_DEFINITIONS.starter.label, 'Launch');
  assert.equal(PLAN_DEFINITIONS.starter.monthlyPriceCents, 2900);
  assert.equal(PLAN_DEFINITIONS.pro.label, 'Momentum');
  assert.equal(PLAN_DEFINITIONS.pro.monthlyPriceCents, 9900);
  assert.equal(PLAN_DEFINITIONS.growth.label, 'Engine');
  assert.equal(PLAN_DEFINITIONS.growth.monthlyPriceCents, 14900);
});

runTest('Launch blocks recurring and upsells, Momentum unlocks recurring/basic upsells, Engine unlocks all growth features', () => {
  assert.equal(planIncludesFeature('starter', 'orders.recurring_schedule'), false);
  assert.equal(planIncludesFeature('starter', 'upsells.basic'), false);

  assert.equal(planIncludesFeature('pro', 'orders.recurring_schedule'), true);
  assert.equal(planIncludesFeature('pro', 'upsells.basic'), true);
  assert.equal(planIncludesFeature('pro', 'campaigns.ai_email'), false);

  assert.equal(planIncludesFeature('growth', 'campaigns.ai_email'), true);
  assert.equal(planIncludesFeature('growth', 'analytics.advanced'), true);
  assert.deepEqual([...getPlanFeatures('growth')].sort(), FEATURE_KEYS.filter((featureKey) => featureKey !== 'growth_advisor').sort());
});

runTest('next plan progression and shared entitlement catalog stay aligned', () => {
  assert.equal(getNextPlan('starter'), 'pro');
  assert.equal(getNextPlan('pro'), 'growth');
  assert.equal(getNextPlan('growth'), null);

  const growthAdvisor = getSharedEntitlementDefinition('growth_advisor');
  assert.equal(growthAdvisor.label, 'Growth Advisor');
  assert.equal(growthAdvisor.monthlyPriceCents, 9900);
  assert.equal(growthAdvisor.interval, 'month');
});
