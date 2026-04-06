import { db } from '@trayloop/database';
import { addOns, catalogs } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateAddOnInput, UpdateAddOnInput } from './add-ons.schema.js';

interface AddOnDto {
  id: string;
  catalogId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  upsellEligible: boolean;
  upsellFeatured: boolean;
  upsellPriority: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(a: typeof addOns.$inferSelect): AddOnDto {
  return {
    id: a.id,
    catalogId: a.catalogId,
    name: a.name,
    description: a.description,
    price: a.price,
    currency: a.currency,
    upsellEligible: a.upsellEligible,
    upsellFeatured: a.upsellFeatured,
    upsellPriority: a.upsellPriority,
    isActive: a.isActive,
    sortOrder: a.sortOrder,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export async function listByOrg(orgId: string) {
  const rows = await db
    .select({ addOn: addOns })
    .from(addOns)
    .innerJoin(catalogs, eq(catalogs.id, addOns.catalogId))
    .where(eq(catalogs.organizationId, orgId));

  return rows.map((r) => toDto(r.addOn));
}

export async function create(orgId: string, input: CreateAddOnInput) {
  // Verify catalog belongs to this org
  const [catalog] = await db
    .select({ id: catalogs.id })
    .from(catalogs)
    .where(and(eq(catalogs.id, input.catalogId), eq(catalogs.organizationId, orgId)))
    .limit(1);

  if (!catalog) {
    throw new NotFoundError('Catalog');
  }

  const [addOn] = await db
    .insert(addOns)
    .values(input)
    .returning();

  return toDto(addOn);
}

export async function update(id: string, input: UpdateAddOnInput) {
  const [updated] = await db
    .update(addOns)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(addOns.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError('Add-on');
  }

  return toDto(updated);
}
