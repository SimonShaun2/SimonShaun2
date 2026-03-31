import { db } from '@trayloop/database';
import {
  organizations,
  locations,
  locationSettings,
  catalogs,
  catalogCategories,
  packages,
  packageItems,
  addOns,
} from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import { create as createOrder } from '../orders/orders.service.js';
import type { CreateOrderInput } from '../orders/orders.schema.js';
import type { EventBus } from '../../lib/event-bus/index.js';

export async function getStorefront(slug: string) {
  // 1. Resolve organization by slug
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      website: organizations.website,
      phone: organizations.phone,
      logoUrl: organizations.logoUrl,
    })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  const orgId = org.id;

  // 2. Fetch locations with explicit columns (avoids schema drift issues)
  const locationRows = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      city: locations.city,
      state: locations.state,
      zipCode: locations.zipCode,
      country: locations.country,
      phone: locations.phone,
      leadTimeDays: locationSettings.leadTimeDays,
      minOrderAmount: locationSettings.minOrderAmount,
      serviceTypes: locationSettings.serviceTypes,
      deliveryEnabled: locationSettings.deliveryEnabled,
      pickupEnabled: locationSettings.pickupEnabled,
      deliveryRadius: locationSettings.deliveryRadius,
      operatingHours: locationSettings.operatingHours,
      depositRequired: locationSettings.depositRequired,
    })
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(and(eq(locations.organizationId, orgId), eq(locations.isActive, true)));

  const locationDtos = locationRows.map((row) => ({
    slug: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    country: row.country,
    phone: row.phone,
    serviceTypes: row.serviceTypes ?? ['delivery'],
    leadTimeHours: (row.leadTimeDays ?? 3) * 24,
    minimumOrderAmount: row.minOrderAmount ?? 0,
    deliveryEnabled: row.deliveryEnabled ?? true,
    pickupEnabled: row.pickupEnabled ?? false,
    deliveryRadiusMiles: row.deliveryRadius ?? null,
    operatingHours: row.operatingHours ?? null,
    depositRequired: row.depositRequired ?? true,
  }));

  // 3. Fetch active catalogs
  const catalogRows = await db
    .select({
      id: catalogs.id,
      name: catalogs.name,
      description: catalogs.description,
    })
    .from(catalogs)
    .where(and(eq(catalogs.organizationId, orgId), eq(catalogs.isActive, true)));

  if (catalogRows.length === 0) {
    return {
      merchant: {
        name: org.name,
        slug: org.slug,
        description: org.description,
        website: org.website,
        phone: org.phone,
        logoUrl: org.logoUrl,
      },
      locations: locationDtos,
      menu: [],
    };
  }

  const catalogIds = catalogRows.map((c) => c.id);

  // 4. Fetch categories, packages, package items, and add-ons in parallel
  const [categoryRows, packageRows, packageItemRows, addOnRows] = await Promise.all([
    db
      .select({
        id: catalogCategories.id,
        catalogId: catalogCategories.catalogId,
        name: catalogCategories.name,
        description: catalogCategories.description,
        sortOrder: catalogCategories.sortOrder,
      })
      .from(catalogCategories)
      .where(eq(catalogCategories.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select({
        id: packages.id,
        catalogId: packages.catalogId,
        categoryId: packages.categoryId,
        name: packages.name,
        description: packages.description,
        pricing: packages.pricing,
        price: packages.price,
        currency: packages.currency,
        minHeadCount: packages.minHeadCount,
        maxHeadCount: packages.maxHeadCount,
        imageUrl: packages.imageUrl,
        sortOrder: packages.sortOrder,
      })
      .from(packages)
      .where(eq(packages.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select({
        id: packageItems.id,
        packageId: packageItems.packageId,
        name: packageItems.name,
        description: packageItems.description,
        isOptional: packageItems.isOptional,
        sortOrder: packageItems.sortOrder,
      })
      .from(packageItems),
    db
      .select({
        id: addOns.id,
        catalogId: addOns.catalogId,
        name: addOns.name,
        description: addOns.description,
        price: addOns.price,
        currency: addOns.currency,
        sortOrder: addOns.sortOrder,
      })
      .from(addOns)
      .where(eq(addOns.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
  ]);

  // 5. Build package items lookup
  const itemsByPackageId = new Map<string, typeof packageItemRows>();
  for (const item of packageItemRows) {
    const existing = itemsByPackageId.get(item.packageId) ?? [];
    existing.push(item);
    itemsByPackageId.set(item.packageId, existing);
  }

  // 6. Build packages
  const packageDtos = packageRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pkg) => {
      const items = (itemsByPackageId.get(pkg.id) ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          name: item.name,
          description: item.description,
          isOptional: item.isOptional,
        }));

      return {
        id: pkg.id,
        categoryId: pkg.categoryId,
        name: pkg.name,
        description: pkg.description,
        pricePerHead: pkg.price,
        currency: pkg.currency,
        minimumHeadcount: pkg.minHeadCount,
        maximumHeadcount: pkg.maxHeadCount,
        imageUrl: pkg.imageUrl,
        includes: items,
      };
    });

  // 7. Build categories with nested packages
  const categoryDtos = categoryRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      packages: packageDtos.filter((p) => p.categoryId === cat.id),
    }));

  const uncategorized = packageDtos.filter((p) => !p.categoryId);

  // 8. Build add-ons
  const addOnDtos = addOnRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      currency: a.currency,
    }));

  // 9. Assemble menu per catalog
  const menu = catalogRows.map((catalog) => ({
    name: catalog.name,
    description: catalog.description,
    categories: categoryDtos.filter((c) =>
      c.packages.some((p) => packageRows.find((pr) => pr.id === p.id && pr.catalogId === catalog.id)),
    ).map((c) => ({
      ...c,
      packages: c.packages.filter((p) => {
        const row = packageRows.find((pr) => pr.id === p.id);
        return row?.catalogId === catalog.id;
      }),
    })),
    uncategorizedPackages: uncategorized.filter((p) => {
      const row = packageRows.find((pr) => pr.id === p.id);
      return row?.catalogId === catalog.id;
    }),
    addOns: addOnDtos.filter((a) => {
      const row = addOnRows.find((ar) => ar.id === a.id);
      return row?.catalogId === catalog.id;
    }),
  }));

  return {
    merchant: {
      name: org.name,
      slug: org.slug,
      description: org.description,
      website: org.website,
      phone: org.phone,
      logoUrl: org.logoUrl,
    },
    locations: locationDtos,
    menu,
  };
}

export async function submitPublicOrder(slug: string, input: CreateOrderInput, eventBus: EventBus) {
  // Resolve org from slug
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  return createOrder(org.id, input, eventBus);
}
