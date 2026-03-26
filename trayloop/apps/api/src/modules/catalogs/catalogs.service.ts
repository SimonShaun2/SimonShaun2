import { db } from '@trayloop/database';
import { catalogs, catalogCategories } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateCatalogInput, UpdateCatalogInput, CreateCategoryInput, UpdateCategoryInput } from './catalogs.schema.js';

// --- Catalog DTOs ---

interface CatalogDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toCatalogDto(c: typeof catalogs.$inferSelect): CatalogDto {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

interface CategoryDto {
  id: string;
  catalogId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toCategoryDto(c: typeof catalogCategories.$inferSelect): CategoryDto {
  return {
    id: c.id,
    catalogId: c.catalogId,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// --- Catalogs ---

export async function listCatalogs(orgId: string) {
  const rows = await db
    .select()
    .from(catalogs)
    .where(eq(catalogs.organizationId, orgId));

  return rows.map(toCatalogDto);
}

export async function createCatalog(orgId: string, input: CreateCatalogInput) {
  const [catalog] = await db
    .insert(catalogs)
    .values({ ...input, organizationId: orgId })
    .returning();

  return toCatalogDto(catalog);
}

// --- Categories ---

export async function listCategories(orgId: string) {
  const rows = await db
    .select({
      category: catalogCategories,
    })
    .from(catalogCategories)
    .innerJoin(catalogs, eq(catalogs.id, catalogCategories.catalogId))
    .where(eq(catalogs.organizationId, orgId));

  return rows.map((r) => toCategoryDto(r.category));
}

export async function createCategory(orgId: string, input: CreateCategoryInput) {
  // Verify catalog belongs to this org
  const [catalog] = await db
    .select({ id: catalogs.id })
    .from(catalogs)
    .where(and(eq(catalogs.id, input.catalogId), eq(catalogs.organizationId, orgId)))
    .limit(1);

  if (!catalog) {
    throw new NotFoundError('Catalog');
  }

  const [category] = await db
    .insert(catalogCategories)
    .values(input)
    .returning();

  return toCategoryDto(category);
}
