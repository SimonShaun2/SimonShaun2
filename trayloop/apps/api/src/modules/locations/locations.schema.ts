import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string().length(2).default('US'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
