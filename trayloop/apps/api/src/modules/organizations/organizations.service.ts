import { db } from '@trayloop/database';
import { organizations, organizationMemberships, locations, catalogs, packages } from '@trayloop/database';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreateOrganizationInput, UpdateOrganizationInput } from './organizations.schema.js';

interface OrgDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
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
    isActive: org.isActive,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
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

  // Check payment setup via stripeAccountId
  let hasPayments = false;
  try {
    const [orgFull] = await db.select({ stripeAccountId: organizations.stripeAccountId })
      .from(organizations).where(eq(organizations.id, orgId)).limit(1);
    hasPayments = !!orgFull?.stripeAccountId;
  } catch { hasPayments = false; }

  const isComplete = hasProfile && hasLocation && hasCatalog && hasPackages;

  return {
    isComplete,
    completedSteps: [hasProfile, hasLocation, hasCatalog, hasPackages, hasPayments].filter(Boolean).length,
    totalSteps: 5,
    steps: {
      profile: { done: hasProfile, label: 'Set up organization profile' },
      location: { done: hasLocation, label: 'Add your first location', count: locationCount.count },
      catalog: { done: hasCatalog, label: 'Create a catalog', count: catalogCount.count },
      packages: { done: hasPackages, label: 'Add at least one package', count: packageCount.count },
      payments: { done: hasPayments, label: 'Connect payment processing' },
    },
  };
}
