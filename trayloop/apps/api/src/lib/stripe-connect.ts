import { db } from '@trayloop/database';
import { organizations } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { getStripe, isStripeEnabled } from './stripe.js';
import { ValidationError } from './errors.js';
import { logger } from '@trayloop/utils';

export interface ConnectAccountStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
}

/**
 * Get the Stripe Connect status for an organization.
 */
export async function getConnectStatus(orgId: string): Promise<ConnectAccountStatus> {
  const [org] = await db
    .select({
      stripeAccountId: organizations.stripeAccountId,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new ValidationError('Organization not found');
  }

  // If no Stripe account, return clean defaults
  if (!org.stripeAccountId) {
    return {
      stripeAccountId: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      onboardingComplete: false,
    };
  }

  // If Stripe is configured, sync live status
  if (isStripeEnabled()) {
    try {
      return await syncConnectStatus(orgId, org.stripeAccountId);
    } catch {
      // Stripe API call failed — return safe defaults with account ID
    }
  }

  return {
    stripeAccountId: org.stripeAccountId,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
    onboardingComplete: false,
  };
}

/**
 * Create a Stripe Connect account for an organization.
 * Safe to call multiple times — returns existing account if already created.
 */
export async function createConnectAccount(orgId: string): Promise<ConnectAccountStatus> {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  // Check if account already exists
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      stripeAccountId: organizations.stripeAccountId,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new ValidationError('Organization not found');
  }

  // If account already exists, sync status from Stripe and return
  if (org.stripeAccountId) {
    return syncConnectStatus(orgId, org.stripeAccountId);
  }

  // Create new Connect account
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    metadata: {
      trayloop_org_id: orgId,
      trayloop_org_slug: org.slug,
    },
    business_profile: {
      name: org.name,
    },
  });

  // Persist the account ID
  await db
    .update(organizations)
    .set({
      stripeAccountId: account.id,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  logger.info('Stripe Connect account created', {
    orgId,
    stripeAccountId: account.id,
  });

  return {
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted ?? false,
    onboardingComplete: false,
  };
}

/**
 * Sync the Connect account status from Stripe into the DB.
 * Call after onboarding or on status check.
 */
export async function syncConnectStatus(orgId: string, stripeAccountId: string): Promise<ConnectAccountStatus> {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured.');
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeAccountId);

  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;
  const detailsSubmitted = account.details_submitted ?? false;
  const onboardingComplete = chargesEnabled && payoutsEnabled && detailsSubmitted;

  // Try to persist status — safe to fail if columns don't exist yet
  try {
    await db
      .update(organizations)
      .set({ updatedAt: new Date() })
      .where(eq(organizations.id, orgId));
  } catch {}

  return {
    stripeAccountId,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    onboardingComplete,
  };
}

/**
 * Create a Stripe-hosted Account Link for onboarding.
 * If no connected account exists yet, creates one first.
 */
export async function createOnboardingLink(
  orgId: string,
  returnUrl: string,
  refreshUrl: string,
): Promise<{ url: string; status: ConnectAccountStatus }> {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  // Ensure account exists (idempotent)
  const status = await createConnectAccount(orgId);

  if (!status.stripeAccountId) {
    throw new ValidationError('Failed to create Stripe account.');
  }

  // If already fully onboarded, no link needed
  if (status.onboardingComplete) {
    return { url: returnUrl, status };
  }

  const stripe = getStripe();
  const accountLink = await stripe.accountLinks.create({
    account: status.stripeAccountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });

  logger.info('Stripe onboarding link created', {
    orgId,
    stripeAccountId: status.stripeAccountId,
  });

  return { url: accountLink.url, status };
}
