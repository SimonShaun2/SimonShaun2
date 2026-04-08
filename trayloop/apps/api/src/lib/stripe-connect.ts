import Stripe from 'stripe';
import { db, organizations } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { getStripe, isStripeEnabled } from './stripe.js';
import { ValidationError } from './errors.js';
import { logger } from '@trayloop/utils';
import { users } from '@trayloop/database';
import { and } from 'drizzle-orm';

export interface ConnectAccountStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
  status: 'not_started' | 'in_progress' | 'action_required' | 'ready';
  disabledReason: string | null;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  requirementsEventuallyDue: string[];
}

function buildStatus(input: {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  disabledReason?: string | null;
  requirementsCurrentlyDue?: string[];
  requirementsPastDue?: string[];
  requirementsEventuallyDue?: string[];
}): ConnectAccountStatus {
  const requirementsCurrentlyDue = input.requirementsCurrentlyDue ?? [];
  const requirementsPastDue = input.requirementsPastDue ?? [];
  const requirementsEventuallyDue = input.requirementsEventuallyDue ?? [];
  const disabledReason = input.disabledReason ?? null;
  const onboardingComplete = input.chargesEnabled && input.payoutsEnabled && input.detailsSubmitted;

  let status: ConnectAccountStatus['status'] = 'not_started';

  if (!input.stripeAccountId) {
    status = 'not_started';
  } else if (onboardingComplete) {
    status = 'ready';
  } else if (disabledReason || requirementsPastDue.length > 0) {
    status = 'action_required';
  } else {
    status = 'in_progress';
  }

  return {
    stripeAccountId: input.stripeAccountId,
    chargesEnabled: input.chargesEnabled,
    payoutsEnabled: input.payoutsEnabled,
    detailsSubmitted: input.detailsSubmitted,
    onboardingComplete,
    status,
    disabledReason,
    requirementsCurrentlyDue,
    requirementsPastDue,
    requirementsEventuallyDue,
  };
}

function emptyStatus(): ConnectAccountStatus {
  return buildStatus({
    stripeAccountId: null,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });
}

function isMissingConnectedAccountError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const stripeError = error as { code?: string; message?: string };
  return stripeError.code === 'resource_missing' || stripeError.message?.includes('No such account') === true;
}

function isConnectPlatformNotEnabledError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const stripeError = error as { message?: string };
  return stripeError.message?.includes("You can only create new accounts if you've signed up") === true;
}

function isConnectResponsibilityMismatchError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const stripeError = error as { message?: string };
  return stripeError.message?.includes('responsibilities of managing losses') === true;
}

function statusFromStripeAccount(account: Stripe.Account): ConnectAccountStatus {
  return buildStatus({
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted ?? false,
    disabledReason: account.requirements?.disabled_reason ?? null,
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
    requirementsPastDue: account.requirements?.past_due ?? [],
    requirementsEventuallyDue: account.requirements?.eventually_due ?? [],
  });
}

async function persistConnectStatus(orgId: string, status: ConnectAccountStatus) {
  await db
    .update(organizations)
    .set({
      stripeAccountId: status.stripeAccountId,
      stripeChargesEnabled: status.chargesEnabled,
      stripePayoutsEnabled: status.payoutsEnabled,
      stripeDetailsSubmitted: status.detailsSubmitted,
      stripeOnboardingComplete: status.onboardingComplete,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));
}

/**
 * Get the persisted Stripe Connect status for an organization.
 * The merchant UI uses this for initial render; explicit sync endpoints refresh it from Stripe.
 */
export async function getConnectStatus(orgId: string): Promise<ConnectAccountStatus> {
  const [org] = await db
    .select({
      stripeAccountId: organizations.stripeAccountId,
      stripeChargesEnabled: organizations.stripeChargesEnabled,
      stripePayoutsEnabled: organizations.stripePayoutsEnabled,
      stripeDetailsSubmitted: organizations.stripeDetailsSubmitted,
      stripeOnboardingComplete: organizations.stripeOnboardingComplete,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new ValidationError('Organization not found');
  }

  if (!org.stripeAccountId) {
    return emptyStatus();
  }

  // Persisted status is the fast path; live sync happens through the explicit sync endpoint
  // or whenever we are already touching Stripe for onboarding.
  return buildStatus({
    stripeAccountId: org.stripeAccountId,
    chargesEnabled: org.stripeChargesEnabled,
    payoutsEnabled: org.stripePayoutsEnabled,
    detailsSubmitted: org.stripeDetailsSubmitted,
  });
}

/**
 * Create a Stripe Connect account for an organization.
 * Safe to call multiple times; reuses the existing account when one is already linked.
 */
export async function createConnectAccount(orgId: string): Promise<ConnectAccountStatus> {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured. Contact support.');
  }

  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      stripeAccountId: organizations.stripeAccountId,
      ownerEmail: users.email,
    })
    .from(organizations)
    .innerJoin(users, eq(users.id, organizations.ownerId))
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new ValidationError('Organization not found');
  }

  if (org.stripeAccountId) {
    try {
      return await syncConnectStatus(orgId, org.stripeAccountId);
    } catch (error) {
      if (!isMissingConnectedAccountError(error)) {
        throw error;
      }

      logger.warn('Stored Stripe Connect account was missing; recreating fresh account', {
        orgId,
        stripeAccountId: org.stripeAccountId,
      });

      await persistConnectStatus(orgId, emptyStatus());
    }
  }

  const stripe = getStripe();
  let account: Stripe.Account;
  try {
    account = await stripe.accounts.create({
      email: org.ownerEmail,
      controller: {
        fees: {
          payer: 'account',
        },
        losses: {
          payments: 'stripe',
        },
        stripe_dashboard: {
          type: 'full',
        },
      },
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      metadata: {
        trayloop_org_id: orgId,
        trayloop_org_slug: org.slug,
      },
      business_profile: {
        name: org.name,
      },
    });
  } catch (error) {
    logger.error('Stripe Connect account creation failed', {
      orgId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    if (isConnectPlatformNotEnabledError(error)) {
      throw new ValidationError('Stripe Connect is not enabled on the TrayLoop platform account yet. Turn on Connect in the live Stripe dashboard, then try merchant payouts again.');
    }
    if (isConnectResponsibilityMismatchError(error)) {
      throw new ValidationError('Stripe Connect is enabled, but the platform responsibility settings still need to finish updating in Stripe. Refresh the live Connect configuration, wait a minute, and try merchant payouts again.');
    }
    throw new ValidationError('Stripe could not start merchant payouts onboarding. Please try again or contact support.');
  }

  const status = statusFromStripeAccount(account);
  await persistConnectStatus(orgId, status);

  logger.info('Stripe Connect account created', {
    orgId,
    stripeAccountId: account.id,
  });

  return status;
}

/**
 * Sync the Connect account status from Stripe into Railway Postgres.
 */
export async function syncConnectStatus(orgId: string, stripeAccountId: string): Promise<ConnectAccountStatus> {
  if (!isStripeEnabled()) {
    throw new ValidationError('Stripe is not configured.');
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeAccountId);
  const status = statusFromStripeAccount(account);

  try {
    await persistConnectStatus(orgId, status);
  } catch (err) {
    logger.warn('Failed to persist Stripe Connect status', {
      orgId,
      stripeAccountId,
      error: (err as Error).message,
    });
  }

  return status;
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

  const status = await createConnectAccount(orgId);

  if (!status.stripeAccountId) {
    throw new ValidationError('Failed to create Stripe account.');
  }

  if (status.onboardingComplete) {
    return { url: returnUrl, status };
  }

  const stripe = getStripe();
  let accountLink: Stripe.AccountLink;
  try {
    accountLink = await stripe.accountLinks.create({
      account: status.stripeAccountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
  } catch (error) {
    logger.error('Stripe onboarding link creation failed', {
      orgId,
      stripeAccountId: status.stripeAccountId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new ValidationError('Stripe could not open merchant payouts onboarding. Please try again or contact support.');
  }

  logger.info('Stripe onboarding link created', {
    orgId,
    stripeAccountId: status.stripeAccountId,
  });

  return { url: accountLink.url, status };
}
