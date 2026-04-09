import { db } from '@trayloop/database';
import { organizations, organizationMemberships, locations, catalogs, packages } from '@trayloop/database';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreateOrganizationInput, UpdateOrganizationInput } from './organizations.schema.js';
import { getConnectStatus } from '../../lib/stripe-connect.js';
import { getStripeMode } from '../../lib/stripe.js';
import { getSubscription } from '../billing/billing.service.js';

interface OrgDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  displayFont: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(org: typeof organizations.$inferSelect): OrgDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    website: org.website,
    phone: org.phone,
    logoUrl: org.logoUrl,
    brandColor: org.brandColor,
    displayFont: org.displayFont,
    isActive: org.isActive,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

function getStorefrontBaseUrl() {
  const configured = process.env.STOREFRONT_URL?.replace(/\/+$/, '');
  if (configured) {
    return configured;
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://order.trayloophq.com'
    : 'http://localhost:3002';
}

export async function listByUser(userId: string) {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logoUrl: organizations.logoUrl,
      isActive: organizations.isActive,
      memberRole: organizationMemberships.role,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(eq(organizationMemberships.userId, userId));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl,
    isActive: row.isActive,
    role: row.memberRole,
  }));
}

export async function create(userId: string, input: CreateOrganizationInput) {
  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, input.slug))
    .limit(1);

  if (existing) {
    throw new ValidationError('Organization slug already taken');
  }

  const [org] = await db
    .insert(organizations)
    .values({
      ...input,
      ownerId: userId,
    })
    .returning();

  await db.insert(organizationMemberships).values({
    userId,
    organizationId: org.id,
    role: 'owner',
    status: 'active',
    joinedAt: new Date(),
  });

  return toDto(org);
}

export async function getById(id: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Organization');
  }

  return toDto(org);
}

export async function update(id: string, input: UpdateOrganizationInput) {
  if (input.slug) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, input.slug))
      .limit(1);

    if (existing && existing.id !== id) {
      throw new ValidationError('Organization slug already taken');
    }
  }

  const [updated] = await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError('Organization');
  }

  return toDto(updated);
}

export async function getSetupStatus(orgId: string) {
  const [org] = await db
    .select({
      name: organizations.name,
      slug: organizations.slug,
      phone: organizations.phone,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) throw new NotFoundError('Organization');

  const [[locationCount], [catalogCount], [packageCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(locations)
      .where(and(eq(locations.organizationId, orgId), eq(locations.isActive, true))),
    db.select({ count: sql<number>`count(*)::int` }).from(catalogs)
      .where(and(eq(catalogs.organizationId, orgId), eq(catalogs.isActive, true))),
    db.select({ count: sql<number>`count(*)::int` }).from(packages)
      .innerJoin(catalogs, eq(catalogs.id, packages.catalogId))
      .where(and(eq(catalogs.organizationId, orgId), eq(packages.isActive, true))),
  ]);

  const hasProfile = !!(org.name && org.slug);
  const hasLocation = locationCount.count > 0;
  const hasCatalog = catalogCount.count > 0;
  const hasPackages = packageCount.count > 0;
  const hasOffering = hasCatalog && hasPackages;

  // Check payment setup via stripeAccountId
  let hasPayments = false;
  try {
    const [orgFull] = await db.select({ stripeAccountId: organizations.stripeAccountId })
      .from(organizations).where(eq(organizations.id, orgId)).limit(1);
    hasPayments = !!orgFull?.stripeAccountId;
  } catch { hasPayments = false; }

  const isComplete = hasProfile && hasLocation && hasOffering;

  return {
    isComplete,
    slug: org.slug,
    completedSteps: [hasOffering, hasLocation, hasPayments].filter(Boolean).length,
    totalSteps: 3,
    steps: {
      offering: { done: hasOffering, label: 'Add your first offering', count: packageCount.count },
      location: { done: hasLocation, label: 'Set your order requirements', count: locationCount.count },
      payments: { done: hasPayments, label: 'Connect payments' },
    },
  };
}

export async function getStorefrontContext(orgId: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Organization');
  }

  const locationRows = await db
    .select({
      id: locations.id,
      name: locations.name,
      city: locations.city,
      state: locations.state,
      isActive: locations.isActive,
      createdAt: locations.createdAt,
    })
    .from(locations)
    .where(eq(locations.organizationId, orgId));

  const storefrontBaseUrl = getStorefrontBaseUrl();
  const storefrontUrl = `${storefrontBaseUrl}/${org.slug}`;
  const activeLocations = locationRows
    .filter((location) => location.isActive)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const defaultLocation = activeLocations[0] ?? null;

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
    },
    storefrontUrl,
    locations: activeLocations.map((location, index) => ({
      id: location.id,
      name: location.name,
      city: location.city,
      state: location.state,
      isDefault: index === 0,
      storefrontUrl: `${storefrontUrl}?location=${encodeURIComponent(location.id)}`,
    })),
    defaultLocationId: defaultLocation?.id ?? null,
    defaultLocationName: defaultLocation?.name ?? null,
  };
}

function hasBillingAccess(state: string) {
  return ['trialing', 'active', 'past_due', 'unpaid'].includes(state);
}

function getNextAction(input: {
  hasOffering: boolean;
  hasLocation: boolean;
  paymentsStatus: string;
  billingState: string;
  storefrontReady: boolean;
}) {
  if (!input.hasOffering) {
    return {
      key: 'offerings',
      title: 'Add your first offering',
      description: 'Build at least one active package so customers have something to order.',
      href: '/catalog',
      cta: 'Open Offerings',
    };
  }

  if (!input.hasLocation) {
    return {
      key: 'location',
      title: 'Finish your location setup',
      description: 'Add order rules, service types, and operating details before you share the storefront.',
      href: '/settings#operations',
      cta: 'Edit Operations',
    };
  }

  if (input.paymentsStatus !== 'ready') {
    return {
      key: 'payments',
      title: 'Finish merchant payouts',
      description: 'Connect your Stripe payout account so TrayLoop can route customer deposits to your business.',
      href: '/onboarding',
      cta: 'Finish Payment Setup',
    };
  }

  if (!hasBillingAccess(input.billingState)) {
    return {
      key: 'billing',
      title: 'Activate TrayLoop Pro',
      description: 'Start your platform subscription so your storefront can stay live after trial.',
      href: '/billing',
      cta: 'Open Billing',
    };
  }

  if (!input.storefrontReady) {
    return {
      key: 'launch',
      title: 'Review your storefront',
      description: 'Test the live customer journey before you share your link.',
      href: '/onboarding',
      cta: 'Review Launch Plan',
    };
  }

  return {
    key: 'live',
    title: 'You are ready to grow',
    description: 'Your payouts, subscription, and storefront are all in place.',
    href: '/billing',
    cta: 'Manage Billing',
  };
}

export async function getMerchantOnboardingStatus(orgId: string) {
  const [organization, setup, storefront, paymentStatus, billing] = await Promise.all([
    getById(orgId),
    getSetupStatus(orgId),
    getStorefrontContext(orgId),
    getConnectStatus(orgId),
    getSubscription(orgId),
  ]);

  const hasOffering = setup.steps.offering.done;
  const hasLocation = setup.steps.location.done;
  const paymentsReady = paymentStatus.status === 'ready';
  const billingReady = hasBillingAccess(billing.state);
  const storefrontReady = setup.isComplete;
  const blockers: string[] = [];

  if (!hasOffering) {
    blockers.push('Add at least one active package to your storefront.');
  }

  if (!hasLocation) {
    blockers.push('Create an active location with lead time and service settings.');
  }

  if (!paymentsReady) {
    blockers.push('Complete merchant payout onboarding in Stripe Connect.');
  }

  if (!billingReady) {
    blockers.push('Start or restore your TrayLoop Pro subscription.');
  }

  const completed = [hasOffering, hasLocation, paymentsReady, billingReady].filter(Boolean).length;
  const total = 4;
  const progressPercent = Math.round((completed / total) * 100);
  const defaultStorefrontUrl = storefront.locations[0]?.storefrontUrl ?? storefront.storefrontUrl;

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    },
    stripeMode: getStripeMode(),
    setup,
    paymentStatus,
    billing,
    storefront,
    readiness: {
      offeringsReady: hasOffering,
      locationReady: hasLocation,
      payoutsReady: paymentsReady,
      billingReady,
      storefrontReady,
      canAcceptDeposits: hasOffering && hasLocation && paymentsReady,
      canLaunchStorefront: storefrontReady && paymentsReady && billingReady,
    },
    launch: {
      completed,
      total,
      progressPercent,
      blockers,
      nextAction: getNextAction({
        hasOffering,
        hasLocation,
        paymentsStatus: paymentStatus.status,
        billingState: billing.state,
        storefrontReady,
      }),
      liveStorefrontUrl: defaultStorefrontUrl,
    },
  };
}
