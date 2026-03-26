import { z } from 'zod';

export const serviceType = z.enum(['delivery', 'pickup']);

export const customerInfoSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

export const deliveryAddressSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().length(2).default('US'),
});

export const selectedPackageSchema = z.object({
  packageId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const selectedAddOnSchema = z.object({
  addOnId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const recurringSettingsSchema = z.object({
  interval: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
  endDate: z.string().datetime().optional(),
  preferredDay: z.string().optional(),
  preferredTime: z.string().optional(),
});

export const createOrderSchema = z.object({
  locationId: z.string().uuid(),
  serviceType: serviceType,
  eventDate: z.string().datetime(),
  headcount: z.number().int().positive(),
  packages: z.array(selectedPackageSchema).min(1),
  addOns: z.array(selectedAddOnSchema).optional(),
  customer: customerInfoSchema,
  deliveryAddress: deliveryAddressSchema.optional(),
  recurring: recurringSettingsSchema.optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !(data.serviceType === 'delivery' && !data.deliveryAddress),
  { message: 'Delivery address required for delivery orders', path: ['deliveryAddress'] },
);

export const orderStatus = z.enum([
  'draft',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatus,
  reason: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
