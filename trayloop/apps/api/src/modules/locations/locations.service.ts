import { db } from '@trayloop/database';
import { locations, locationSettings } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateLocationInput, UpdateLocationInput } from './locations.schema.js';

interface LocationDto {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  serviceTypes: string[];
  leadTimeHours: number;
  minimumOrderAmount: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadiusMiles: number | null;
  depositRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function normalizeServiceTypes(
  serviceTypes: string[] | null | undefined,
  deliveryEnabled: boolean | null | undefined,
  pickupEnabled: boolean | null | undefined,
) {
  const next = new Set(serviceTypes ?? []);

  if (deliveryEnabled ?? true) {
    next.add('delivery');
  } else {
    next.delete('delivery');
  }

  if (pickupEnabled ?? false) {
    next.add('pickup');
  } else {
    next.delete('pickup');
  }

  return next.size > 0 ? Array.from(next) : ['delivery'];
}

function toDto(
  loc: typeof locations.$inferSelect,
  settings: typeof locationSettings.$inferSelect | null,
): LocationDto {
  return {
    id: loc.id,
    name: loc.name,
    address: loc.address,
    city: loc.city,
    state: loc.state,
    zipCode: loc.zipCode,
    country: loc.country,
    phone: loc.phone,
    email: loc.email,
    serviceTypes: normalizeServiceTypes(
      settings?.serviceTypes,
      settings?.deliveryEnabled,
      settings?.pickupEnabled,
    ),
    leadTimeHours: (settings?.leadTimeDays ?? 3) * 24,
    minimumOrderAmount: settings?.minOrderAmount ?? 0,
    deliveryEnabled: settings?.deliveryEnabled ?? true,
    pickupEnabled: settings?.pickupEnabled ?? false,
    deliveryRadiusMiles: settings?.deliveryRadius ?? null,
    depositRequired: settings?.depositRequired ?? true,
    isActive: loc.isActive,
    createdAt: loc.createdAt,
    updatedAt: loc.updatedAt,
  };
}

export async function listByOrg(orgId: string) {
  const rows = await db
    .select()
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(eq(locations.organizationId, orgId));

  return rows.map((row) => toDto(row.locations, row.location_settings));
}

export async function getById(id: string) {
  const [row] = await db
    .select()
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(eq(locations.id, id))
    .limit(1);

  if (!row) {
    throw new NotFoundError('Location');
  }

  return toDto(row.locations, row.location_settings);
}

export async function create(orgId: string, input: CreateLocationInput) {
  const {
    serviceTypes,
    leadTimeHours,
    minimumOrderAmount,
    deliveryEnabled,
    pickupEnabled,
    deliveryRadiusMiles,
    depositRequired,
    ...locationData
  } = input;

  const [loc] = await db
    .insert(locations)
    .values({
      ...locationData,
      organizationId: orgId,
    })
    .returning();

  const [settings] = await db
    .insert(locationSettings)
    .values({
      locationId: loc.id,
      serviceTypes: normalizeServiceTypes(serviceTypes, deliveryEnabled, pickupEnabled),
      leadTimeDays: Math.ceil((leadTimeHours ?? 72) / 24),
      minOrderAmount: minimumOrderAmount ?? 0,
      deliveryEnabled: deliveryEnabled ?? true,
      pickupEnabled: pickupEnabled ?? false,
      deliveryRadius: deliveryRadiusMiles ?? null,
      depositRequired: depositRequired ?? true,
    })
    .returning();

  return toDto(loc, settings);
}

export async function update(id: string, input: UpdateLocationInput) {
  const {
    serviceTypes,
    leadTimeHours,
    minimumOrderAmount,
    deliveryEnabled,
    pickupEnabled,
    deliveryRadiusMiles,
    depositRequired,
    ...locationData
  } = input;

  if (Object.keys(locationData).length > 0) {
    const [updated] = await db
      .update(locations)
      .set({ ...locationData, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError('Location');
    }
  }

  const settingsUpdate: Record<string, unknown> = {};
  if (serviceTypes !== undefined || deliveryEnabled !== undefined || pickupEnabled !== undefined) {
    const [existingSettings] = await db
      .select({
        serviceTypes: locationSettings.serviceTypes,
        deliveryEnabled: locationSettings.deliveryEnabled,
        pickupEnabled: locationSettings.pickupEnabled,
      })
      .from(locationSettings)
      .where(eq(locationSettings.locationId, id))
      .limit(1);

    settingsUpdate.serviceTypes = normalizeServiceTypes(
      serviceTypes ?? existingSettings?.serviceTypes,
      deliveryEnabled ?? existingSettings?.deliveryEnabled,
      pickupEnabled ?? existingSettings?.pickupEnabled,
    );
  }
  if (leadTimeHours !== undefined) settingsUpdate.leadTimeDays = Math.ceil(leadTimeHours / 24);
  if (minimumOrderAmount !== undefined) settingsUpdate.minOrderAmount = minimumOrderAmount;
  if (deliveryEnabled !== undefined) settingsUpdate.deliveryEnabled = deliveryEnabled;
  if (pickupEnabled !== undefined) settingsUpdate.pickupEnabled = pickupEnabled;
  if (deliveryRadiusMiles !== undefined) settingsUpdate.deliveryRadius = deliveryRadiusMiles;
  if (depositRequired !== undefined) settingsUpdate.depositRequired = depositRequired;

  if (Object.keys(settingsUpdate).length > 0) {
    settingsUpdate.updatedAt = new Date();
    await db
      .update(locationSettings)
      .set(settingsUpdate)
      .where(eq(locationSettings.locationId, id));
  }

  return getById(id);
}
