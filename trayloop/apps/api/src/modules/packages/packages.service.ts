import { db } from '@trayloop/database';
import { packages, catalogs, catalogCategories } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreatePackageInput, UpdatePackageInput } from './packages.schema.js';

interface PackageDto {
  id: string;
  catalogId: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  pricePerHead: number;
  currency: string;
  minimumHeadcount: number | null;
  maximumHeadcount: number | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(
  pkg: typeof packages.$inferSelect,
  categoryName?: string | null,
): PackageDto {
  return {
    id: pkg.id,
    catalogId: pkg.catalogId,
    categoryId: pkg.categoryId,
    categoryName: categoryName ?? null,
    name: pkg.name,
    description: pkg.description,
    pricePerHead: pkg.price,
    currency: pkg.currency,
    minimumHeadcount: pkg.minHeadCount,
    maximumHeadcount: pkg.maxHeadCount,
    imageUrl: pkg.imageUrl,
    isActive: pkg.isActive,
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
}

export async function listByOrg(orgId: string) {
  const rows = await db
    .select({
      pkg: packages,
      categoryName: catalogCategories.name,
    })
    .from(packages)
    .innerJoin(catalogs, eq(catalogs.id, packages.catalogId))
    .leftJoin(catalogCategories, eq(catalogCategories.id, packages.categoryId))
    .where(eq(catalogs.organizationId, orgId));

  return rows.map((r) => toDto(r.pkg, r.categoryName));
}

export async function getById(id: string) {
  const [row] = await db
    .select({
      pkg: packages,
      categoryName: catalogCategories.name,
    })
    .from(packages)
    .leftJoin(catalogCategories, eq(catalogCategories.id, packages.categoryId))
    .where(eq(packages.id, id))
    .limit(1);

  if (!row) {
    throw new NotFoundError('Package');
  }

  return toDto(row.pkg, row.categoryName);
}

export async function create(orgId: string, input: CreatePackageInput) {
  // Verify catalog belongs to this org
  const [catalog] = await db
    .select({ id: catalogs.id })
    .from(catalogs)
    .where(and(eq(catalogs.id, input.catalogId), eq(catalogs.organizationId, orgId)))
    .limit(1);

  if (!catalog) {
    throw new NotFoundError('Catalog');
  }

  const { pricePerHead, minimumHeadcount, maximumHeadcount, ...rest } = input;

  const [pkg] = await db
    .insert(packages)
    .values({
      ...rest,
      pricing: 'per_head',
      price: pricePerHead,
      minHeadCount: minimumHeadcount ?? 1,
      maxHeadCount: maximumHeadcount ?? null,
    })
    .returning();

  return toDto(pkg);
}

export async function update(id: string, input: UpdatePackageInput) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pricePerHead !== undefined) updateData.price = input.pricePerHead;
  if (input.minimumHeadcount !== undefined) updateData.minHeadCount = input.minimumHeadcount;
  if (input.maximumHeadcount !== undefined) updateData.maxHeadCount = input.maximumHeadcount;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const [updated] = await db
    .update(packages)
    .set(updateData)
    .where(eq(packages.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError('Package');
  }

  return getById(id);
}
