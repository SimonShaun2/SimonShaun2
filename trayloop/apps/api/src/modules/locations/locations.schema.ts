import { z } from 'zod';

export const serviceType = z.enum(['delivery', 'pickup', 'full_service', 'on_site', 'food_truck']);

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().length(2).default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  serviceTypes: z.array(serviceType).min(1).default(['delivery']),
  leadTimeHours: z.number().int().nonnegative().default(72),
  minimumOrderAmount: z.number().int().nonnegative().default(0),
  deliveryEnabled: z.boolean().default(true),
  pickupEnabled: z.boolean().default(false),
  deliveryRadiusMiles: z.number().int().positive().optional(),
  depositRequired: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
