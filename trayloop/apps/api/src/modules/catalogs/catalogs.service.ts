import { db } from '@trayloop/database';
import { catalogs, catalogCategories, packages, addOns } from '@trayloop/database';
import { eq, and, desc } from 'drizzle-orm';
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

export async function updateCatalog(orgId: string, id: string, input: UpdateCatalogInput) {
  const [existing] = await db
    .select({ id: catalogs.id })
    .from(catalogs)
    .where(and(eq(catalogs.id, id), eq(catalogs.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Catalog');
  }

  const [updated] = await db
    .update(catalogs)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(catalogs.id, id))
    .returning();

  return toCatalogDto(updated);
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

export async function updateCategory(orgId: string, id: string, input: UpdateCategoryInput) {
  const [existing] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .innerJoin(catalogs, eq(catalogs.id, catalogCategories.catalogId))
    .where(and(eq(catalogCategories.id, id), eq(catalogs.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Category');
  }

  const [updated] = await db
    .update(catalogCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(catalogCategories.id, id))
    .returning();

  return toCategoryDto(updated);
}

// --- Full menu tree ---

export async function getFullMenu(orgId: string) {
  const [catalogRows, categoryRows, packageRows, addOnRows] = await Promise.all([
    db.select({
      id: catalogs.id, name: catalogs.name, description: catalogs.description, isActive: catalogs.isActive,
    }).from(catalogs).where(eq(catalogs.organizationId, orgId)),
    db.select({
      id: catalogCategories.id, catalogId: catalogCategories.catalogId,
      name: catalogCategories.name, description: catalogCategories.description,
      sortOrder: catalogCategories.sortOrder, isActive: catalogCategories.isActive,
    }).from(catalogCategories)
      .innerJoin(catalogs, eq(catalogs.id, catalogCategories.catalogId))
      .where(eq(catalogs.organizationId, orgId)),
    db.select({
      id: packages.id, catalogId: packages.catalogId, categoryId: packages.categoryId,
      name: packages.name, description: packages.description,
      price: packages.price, currency: packages.currency, pricing: packages.pricing,
      minHeadCount: packages.minHeadCount, maxHeadCount: packages.maxHeadCount,
      imageUrl: packages.imageUrl,
      isActive: packages.isActive, sortOrder: packages.sortOrder,
    }).from(packages)
      .innerJoin(catalogs, eq(catalogs.id, packages.catalogId))
      .where(eq(catalogs.organizationId, orgId)),
    db.select({
      id: addOns.id, catalogId: addOns.catalogId,
      name: addOns.name, description: addOns.description,
      imageUrl: addOns.imageUrl,
      price: addOns.price, currency: addOns.currency,
      isActive: addOns.isActive, sortOrder: addOns.sortOrder,
    }).from(addOns)
      .innerJoin(catalogs, eq(catalogs.id, addOns.catalogId))
      .where(eq(catalogs.organizationId, orgId)),
  ]);

  return catalogRows.map((catalog) => ({
    id: catalog.id,
    name: catalog.name,
    description: catalog.description,
    isActive: catalog.isActive,
    categories: categoryRows
      .filter((c) => c.catalogId === catalog.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((cat) => ({
        id: cat.id,
        catalogId: cat.catalogId,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        packages: packageRows
          .filter((p) => p.categoryId === cat.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((p) => ({
            id: p.id,
            catalogId: p.catalogId,
            categoryId: p.categoryId,
            name: p.name,
            description: p.description,
            pricePerHead: p.price, currency: p.currency, pricing: p.pricing,
            minHeadCount: p.minHeadCount, maxHeadCount: p.maxHeadCount,
            imageUrl: p.imageUrl,
            isActive: p.isActive,
          })),
      })),
    uncategorizedPackages: packageRows
      .filter((p) => p.catalogId === catalog.id && !p.categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({
        id: p.id,
        catalogId: p.catalogId,
        categoryId: p.categoryId,
        name: p.name,
        description: p.description,
        pricePerHead: p.price, currency: p.currency, pricing: p.pricing,
        minHeadCount: p.minHeadCount, maxHeadCount: p.maxHeadCount,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
      })),
    addOns: addOnRows
      .filter((a) => a.catalogId === catalog.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((a) => ({
        id: a.id,
        catalogId: a.catalogId,
        name: a.name,
        description: a.description,
        imageUrl: a.imageUrl,
        price: a.price,
        currency: a.currency,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
      })),
  }));
}
