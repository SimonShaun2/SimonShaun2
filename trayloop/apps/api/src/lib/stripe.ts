import Stripe from 'stripe';
import { logger } from '@trayloop/utils';
import { type BillingCycleKey, type PlanKey } from '@trayloop/types';
import { type SharedEntitlementKey } from '@trayloop/types';

let stripeClient: Stripe | null = null;

export interface StripeConfig {
  secretKey: string;
  publishableKey: string | null;
  webhookSecret: string;
  starterPriceId: string | null;
  proPriceId: string | null;
  growthPriceId: string | null;
  sharedEntitlementPriceIds: Record<SharedEntitlementKey, string | null>;
  subscriptionTrialDays: number;
}

export type StripeMode = 'test' | 'live' | 'disabled';

function getFirstDefinedEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function loadConfig(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const starterPriceId = getFirstDefinedEnv(
    'STRIPE_LAUNCH_PRICE_ID',
    'STRIPE_STARTER_PRICE_ID',
    'STRIPE_PRICE_ID',
  );
  const proPriceId = getFirstDefinedEnv(
    'STRIPE_MOMENTUM_PRICE_ID',
    'STRIPE_Momentum_PRICE_ID',
    'STRIPE_PRO_PRICE_ID',
  );
  const growthPriceId = getFirstDefinedEnv(
    'STRIPE_ENGINE_PRICE_ID',
    'STRIPE_ENGINE_PRICE',
    'STRIPE_GROWTH_PRICE_ID',
  );
  const sharedEntitlementPriceIds: Record<SharedEntitlementKey, string | null> = {
    growth_advisor: getFirstDefinedEnv('STRIPE_GROWTH_ADVISOR_PRICE_ID'),
  };
  const subscriptionTrialDays = Number.parseInt(process.env.STRIPE_SUBSCRIPTION_TRIAL_DAYS ?? '0', 10);

  if (!secretKey || !webhookSecret) {
    return null;
  }

  // Reject obvious placeholder values
  if (secretKey.startsWith('sk_test_xxx') || secretKey === 'sk_test_xxx') {
    return null;
  }

  return {
    secretKey,
    publishableKey: publishableKey ?? null,
    webhookSecret,
    starterPriceId,
    proPriceId,
    growthPriceId,
    sharedEntitlementPriceIds,
    subscriptionTrialDays: Number.isNaN(subscriptionTrialDays) ? 0 : Math.max(0, subscriptionTrialDays),
  };
}

/**
 * Initialize the Stripe client. Call once at API startup.
 * Returns true if Stripe is configured and ready.
 */
export function initStripe(): boolean {
  const config = loadConfig();

  if (!config) {
    logger.warn('Stripe not configured — payment features disabled', {
      hint: 'Set STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET',
    });
    return false;
  }

  stripeClient = new Stripe(config.secretKey, {
    typescript: true,
  });

  logger.info('Stripe initialized', {
    mode: config.secretKey.startsWith('sk_live_') ? 'live' : 'test',
  });

  return true;
}

/**
 * Get the Stripe client instance. Throws if Stripe is not initialized.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
  }
  return stripeClient;
}

/**
 * Check if Stripe is configured and available.
 */
export function isStripeEnabled(): boolean {
  return stripeClient !== null;
}

/**
 * Get the publishable key for client-side use.
 */
export function getPublishableKey(): string | null {
  const config = loadConfig();
  return config?.publishableKey ?? null;
}

/**
 * Get the webhook secret for signature verification.
 */
export function getWebhookSecret(): string {
  const config = loadConfig();
  if (!config) {
    throw new Error('Stripe webhook secret is not configured.');
  }
  return config.webhookSecret;
}

export function getConfiguredSubscriptionPriceIds() {
  const config = loadConfig();

  return {
    starter: config?.starterPriceId ?? null,
    pro: config?.proPriceId ?? null,
    growth: config?.growthPriceId ?? null,
  } satisfies Record<PlanKey, string | null>;
}

export function getConfiguredSharedEntitlementPriceIds(): Record<SharedEntitlementKey, string | null> {
  const config = loadConfig();

  return config?.sharedEntitlementPriceIds ?? {
    growth_advisor: null,
  };
}

export function getSharedEntitlementPriceId(entitlementKey: SharedEntitlementKey): string | null {
  return getConfiguredSharedEntitlementPriceIds()[entitlementKey] ?? null;
}

export function getSubscriptionPriceId(plan: PlanKey, billingCycle: BillingCycleKey = 'monthly'): string {
  if (billingCycle !== 'monthly') {
    throw new Error(`Stripe ${billingCycle} price is not configured for ${plan}.`);
  }

  const configured = getConfiguredSubscriptionPriceIds()[plan];

  if (!configured) {
    const envName =
      plan === 'starter'
        ? 'STRIPE_LAUNCH_PRICE_ID'
        : plan === 'pro'
          ? 'STRIPE_MOMENTUM_PRICE_ID'
          : 'STRIPE_ENGINE_PRICE_ID';
    throw new Error(`Stripe subscription price is not configured for ${plan}. Set ${envName}.`);
  }

  return configured;
}

export function getPlanForStripePriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) {
    return null;
  }

  const configured = getConfiguredSubscriptionPriceIds();
  for (const [planKey, configuredPriceId] of Object.entries(configured) as Array<[PlanKey, string | null]>) {
    if (configuredPriceId === priceId) {
      return planKey;
    }
  }

  return null;
}

export function getSubscriptionTrialDays(): number {
  const config = loadConfig();
  return config?.subscriptionTrialDays ?? 0;
}

export function getGrowthAdvisorPriceId(): string | null {
  return getSharedEntitlementPriceId('growth_advisor');
}

export function getStripeMode(): StripeMode {
  const config = loadConfig();
  if (!config) {
    return 'disabled';
  }

  return config.secretKey.startsWith('sk_live_') ? 'live' : 'test';
}
