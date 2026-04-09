import {
  addOns,
  catalogs,
  locations,
  locationSettings,
  orders,
  organizations,
  packages,
} from '@trayloop/database';
import { db } from '@trayloop/database';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  OpenAIRequestError,
  generateGrowthAdvisor,
  isOpenAIEnabled,
  type GeneratedGrowthAdvisorPlan,
} from '../../lib/openai.js';
import { ValidationError } from '../../lib/errors.js';
import type { AnalyzeGrowthAdvisorInput } from './growth-advisor.schema.js';

const FINAL_ORDER_STATUSES = ['confirmed', 'completed'] as const;

interface GrowthAdvisorSnapshot {
  organizationName: string;
  cuisineHint: string | null;
  website: string | null;
  activeLocations: number;
  activePackages: number;
  activeAddOns: number;
  averagePackagePriceCents: number | null;
  priceRange: {
    lowCents: number | null;
    highCents: number | null;
  };
  leadTimeDays: number | null;
  minimumOrderCents: number | null;
  depositRequired: boolean | null;
  serviceTypes: string[];
  completedOrders: number;
  recentOrders30d: number;
  averageOrderValueCents: number | null;
  packageNames: string[];
  payoutsReady: boolean;
}

export interface GrowthAdvisorResult {
  snapshot: GrowthAdvisorSnapshot;
  analysis: GeneratedGrowthAdvisorPlan;
}

async function getOrganizationSnapshot(orgId: string): Promise<GrowthAdvisorSnapshot> {
  const [organization] = await db
    .select({
      name: organizations.name,
      description: organizations.description,
      website: organizations.website,
      stripeOnboardingComplete: organizations.stripeOnboardingComplete,
      stripeChargesEnabled: organizations.stripeChargesEnabled,
      stripePayoutsEnabled: organizations.stripePayoutsEnabled,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!organization) {
    throw new ValidationError('Organization not found.');
  }

  const activeLocationRows = await db
    .select({
      leadTimeDays: locationSettings.leadTimeDays,
      minOrderAmount: locationSettings.minOrderAmount,
      depositRequired: locationSettings.depositRequired,
      serviceTypes: locationSettings.serviceTypes,
    })
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(and(eq(locations.organizationId, orgId), eq(locations.isActive, true)));

  const packageRows = await db
    .select({
      name: packages.name,
      price: packages.price,
    })
    .from(packages)
    .innerJoin(catalogs, eq(catalogs.id, packages.catalogId))
    .where(
      and(
        eq(catalogs.organizationId, orgId),
        eq(catalogs.isActive, true),
        eq(packages.isActive, true),
      ),
    );

  const [addOnCountRow] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(addOns)
    .innerJoin(catalogs, eq(catalogs.id, addOns.catalogId))
    .where(
      and(
        eq(catalogs.organizationId, orgId),
        eq(catalogs.isActive, true),
        eq(addOns.isActive, true),
      ),
    );

  const [orderStats] = await db
    .select({
      completedOrders: sql<number>`count(*)::int`,
      recentOrders30d: sql<number>`count(*) filter (where coalesce(${orders.completedAt}, ${orders.createdAt}) >= now() - interval '30 days')::int`,
      averageOrderValueCents: sql<number>`coalesce(avg(${orders.totalAmount}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.organizationId, orgId),
        inArray(orders.status, [...FINAL_ORDER_STATUSES]),
      ),
    );

  const packagePrices = packageRows.map((row) => row.price);
  const leadTimeValues = activeLocationRows
    .map((row) => row.leadTimeDays)
    .filter((value): value is number => typeof value === 'number');
  const minimumOrderValues = activeLocationRows
    .map((row) => row.minOrderAmount)
    .filter((value): value is number => typeof value === 'number');
  const depositFlags = activeLocationRows
    .map((row) => row.depositRequired)
    .filter((value): value is boolean => typeof value === 'boolean');
  const serviceTypes = Array.from(
    new Set(
      activeLocationRows.flatMap((row) =>
        Array.isArray(row.serviceTypes) ? row.serviceTypes : [],
      ),
    ),
  );

  return {
    organizationName: organization.name,
    cuisineHint: organization.description,
    website: organization.website,
    activeLocations: activeLocationRows.length,
    activePackages: packageRows.length,
    activeAddOns: addOnCountRow?.count ?? 0,
    averagePackagePriceCents:
      packagePrices.length > 0
        ? Math.round(packagePrices.reduce((sum, value) => sum + value, 0) / packagePrices.length)
        : null,
    priceRange: {
      lowCents: packagePrices.length > 0 ? Math.min(...packagePrices) : null,
      highCents: packagePrices.length > 0 ? Math.max(...packagePrices) : null,
    },
    leadTimeDays:
      leadTimeValues.length > 0 ? Math.min(...leadTimeValues) : null,
    minimumOrderCents:
      minimumOrderValues.length > 0 ? Math.max(...minimumOrderValues) : null,
    depositRequired:
      depositFlags.length > 0 ? depositFlags.some(Boolean) : null,
    serviceTypes,
    completedOrders: orderStats?.completedOrders ?? 0,
    recentOrders30d: orderStats?.recentOrders30d ?? 0,
    averageOrderValueCents:
      orderStats && orderStats.completedOrders > 0 ? orderStats.averageOrderValueCents : null,
    packageNames: packageRows.map((row) => row.name).slice(0, 6),
    payoutsReady:
      organization.stripeOnboardingComplete &&
      organization.stripeChargesEnabled &&
      organization.stripePayoutsEnabled,
  };
}

export async function generateGrowthAdvisorPlan(
  orgId: string,
  input: AnalyzeGrowthAdvisorInput,
): Promise<GrowthAdvisorResult> {
  if (!isOpenAIEnabled()) {
    throw new ValidationError('OpenAI is not configured yet. Add OPENAI_API_KEY to enable Growth Advisor.');
  }

  const snapshot = await getOrganizationSnapshot(orgId);

  try {
    const analysis = await generateGrowthAdvisor({
      organizationName: snapshot.organizationName,
      cuisineHint: snapshot.cuisineHint,
      website: snapshot.website,
      activeLocations: snapshot.activeLocations,
      activePackages: snapshot.activePackages,
      activeAddOns: snapshot.activeAddOns,
      averagePackagePriceCents: snapshot.averagePackagePriceCents,
      priceRange: snapshot.priceRange,
      leadTimeDays: snapshot.leadTimeDays,
      minimumOrderCents: snapshot.minimumOrderCents,
      depositRequired: snapshot.depositRequired,
      serviceTypes: snapshot.serviceTypes,
      completedOrders: snapshot.completedOrders,
      recentOrders30d: snapshot.recentOrders30d,
      averageOrderValueCents: snapshot.averageOrderValueCents,
      packageNames: snapshot.packageNames,
      merchantNotes: input.notes ?? null,
    });

    return { snapshot, analysis };
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      throw new ValidationError(`Growth Advisor is unavailable right now: ${error.message}`);
    }

    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }

    throw new ValidationError('Growth Advisor could not generate a plan right now.');
  }
}
