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

export async function getStorefront(slug: string) {
  // 1. Resolve organization by slug
  const [org] = await db
    .select({
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      website: organizations.website,
      phone: organizations.phone,
      logoUrl: organizations.logoUrl,
      id: organizations.id,
    })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  const orgId = org.id;

  // 2. Fetch active locations with settings
  const locationRows = await db
    .select()
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(and(eq(locations.organizationId, orgId), eq(locations.isActive, true)));

  const locationDtos = locationRows.map((row) => ({
    slug: row.locations.id,
    name: row.locations.name,
    address: row.locations.address,
    city: row.locations.city,
    state: row.locations.state,
    zipCode: row.locations.zipCode,
    country: row.locations.country,
    phone: row.locations.phone,
    serviceTypes: row.location_settings?.serviceTypes ?? ['delivery'],
    leadTimeHours: (row.location_settings?.leadTimeDays ?? 3) * 24,
    minimumOrderAmount: row.location_settings?.minOrderAmount ?? 0,
    deliveryEnabled: row.location_settings?.deliveryEnabled ?? true,
    pickupEnabled: row.location_settings?.pickupEnabled ?? false,
    deliveryRadiusMiles: row.location_settings?.deliveryRadius ?? null,
    depositRequired: row.location_settings?.depositRequired ?? true,
    operatingHours: row.location_settings?.operatingHours ?? null,
  }));

  // 3. Fetch active catalogs
  const catalogRows = await db
    .select()
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
      .select()
      .from(catalogCategories)
      .where(eq(catalogCategories.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select()
      .from(packageItems)
      .then((rows) => rows),
    db
      .select()
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

  // 6. Build packages grouped by category
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

  // Packages without a category
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
