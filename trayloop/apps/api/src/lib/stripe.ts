import Stripe from 'stripe';
import { logger } from '@trayloop/utils';

let stripeClient: Stripe | null = null;

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  subscriptionPriceId: string | null;
  subscriptionTrialDays: number;
}

export type StripeMode = 'test' | 'live' | 'disabled';

function loadConfig(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const subscriptionPriceId = process.env.STRIPE_PRICE_ID ?? null;
  const subscriptionTrialDays = Number.parseInt(process.env.STRIPE_SUBSCRIPTION_TRIAL_DAYS ?? '30', 10);

  if (!secretKey || !publishableKey || !webhookSecret) {
    return null;
  }

  // Reject obvious placeholder values
  if (secretKey.startsWith('sk_test_xxx') || secretKey === 'sk_test_xxx') {
    return null;
  }

  return {
    secretKey,
    publishableKey,
    webhookSecret,
    subscriptionPriceId,
    subscriptionTrialDays: Number.isNaN(subscriptionTrialDays) ? 30 : subscriptionTrialDays,
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

export function getSubscriptionPriceId(): string {
  const config = loadConfig();
  if (!config?.subscriptionPriceId) {
    throw new Error('Stripe subscription price is not configured. Set STRIPE_PRICE_ID.');
  }
  return config.subscriptionPriceId;
}

export function getSubscriptionTrialDays(): number {
  const config = loadConfig();
  return config?.subscriptionTrialDays ?? 30;
}

export function getStripeMode(): StripeMode {
  const config = loadConfig();
  if (!config) {
    return 'disabled';
  }

  return config.secretKey.startsWith('sk_live_') ? 'live' : 'test';
}
