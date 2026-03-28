import Stripe from 'stripe';
import { logger } from '@trayloop/utils';

let stripeClient: Stripe | null = null;

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

function loadConfig(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !publishableKey || !webhookSecret) {
    return null;
  }

  // Reject obvious placeholder values
  if (secretKey.startsWith('sk_test_xxx') || secretKey === 'sk_test_xxx') {
    return null;
  }

  return { secretKey, publishableKey, webhookSecret };
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
    apiVersion: '2025-03-31.basil',
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
