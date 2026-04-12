import assert from 'node:assert/strict';
import {
  getMinimumPlanForFeature,
  normalizeBillingCycle,
  normalizePlanKey,
  resolveUpgradePlan,
} from './plan-access.js';
import {
  getConfiguredSharedEntitlementPriceIds,
  getConfiguredSubscriptionPriceIds,
  getPlanForStripePriceId,
  getSharedEntitlementPriceId,
  getSubscriptionPriceId,
} from './stripe.js';

function runTest(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

runTest('plan normalization defaults safely to Launch when data is missing or unexpected', () => {
  assert.equal(normalizePlanKey('starter'), 'starter');
  assert.equal(normalizePlanKey('pro'), 'pro');
  assert.equal(normalizePlanKey('growth'), 'growth');
  assert.equal(normalizePlanKey(null), 'starter');
  assert.equal(normalizePlanKey('legacy-plan'), 'starter');
});

runTest('upgrade paths resolve to Momentum and Engine correctly', () => {
  assert.equal(getMinimumPlanForFeature('orders.recurring_schedule'), 'pro');
  assert.equal(resolveUpgradePlan('starter', 'orders.recurring_schedule'), 'pro');
  assert.equal(resolveUpgradePlan('pro', 'campaigns.ai_email'), 'growth');
  assert.equal(resolveUpgradePlan('growth', 'campaigns.ai_email'), null);
  assert.equal(normalizeBillingCycle('annual'), 'annual');
  assert.equal(normalizeBillingCycle(undefined), 'monthly');
});

runTest('Stripe pricing config reads Launch, Momentum, Engine, and Growth Advisor env vars', () => {
  const originalEnv = { ...process.env };

  process.env.STRIPE_LAUNCH_PRICE_ID = 'price_launch_123';
  process.env.STRIPE_MOMENTUM_PRICE_ID = 'price_momentum_456';
  process.env.STRIPE_ENGINE_PRICE_ID = 'price_engine_789';
  process.env.STRIPE_GROWTH_ADVISOR_PRICE_ID = 'price_growth_advisor_101';
  process.env.STRIPE_SECRET_KEY = 'sk_test_example';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_example';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';

  try {
    assert.deepEqual(getConfiguredSubscriptionPriceIds(), {
      starter: 'price_launch_123',
      pro: 'price_momentum_456',
      growth: 'price_engine_789',
    });
    assert.deepEqual(getConfiguredSharedEntitlementPriceIds(), {
      growth_advisor: 'price_growth_advisor_101',
    });
    assert.equal(getSubscriptionPriceId('starter'), 'price_launch_123');
    assert.equal(getSubscriptionPriceId('pro'), 'price_momentum_456');
    assert.equal(getSubscriptionPriceId('growth'), 'price_engine_789');
    assert.equal(getSharedEntitlementPriceId('growth_advisor'), 'price_growth_advisor_101');
    assert.equal(getPlanForStripePriceId('price_launch_123'), 'starter');
    assert.equal(getPlanForStripePriceId('price_momentum_456'), 'pro');
    assert.equal(getPlanForStripePriceId('price_engine_789'), 'growth');
    assert.equal(getPlanForStripePriceId('price_unknown'), null);
  } finally {
    process.env = originalEnv;
  }
});
