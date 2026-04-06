import { z } from 'zod';

// --- Order creation (storefront submission) ---

export const serviceType = z.enum(['delivery', 'pickup', 'full_service', 'on_site', 'food_truck']);

export const customerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(255).trim(),
  lastName: z.string().min(1, 'Last name is required').max(255).trim(),
  email: z.string().email('Valid email is required').trim().toLowerCase(),
  phone: z.string().min(7, 'Phone number too short').max(20).optional(),
  companyName: z.string().max(255).trim().optional(),
});

export const deliveryAddressSchema = z.object({
  address: z.string().min(1, 'Street address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  zipCode: z.string().min(3, 'Zip code is required').max(20).trim(),
  country: z.string().length(2).default('US'),
});

export const selectedPackageSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
  quantity: z.number().int().positive().default(1),
});

export const selectedAddOnSchema = z.object({
  addOnId: z.string().uuid('Invalid add-on ID'),
  quantity: z.number().int().positive().default(1),
});

export const upsellAttributionSchema = z.object({
  addOnId: z.string().uuid('Invalid add-on ID'),
  sessionKey: z.string().min(8).max(64),
  recommendationType: z.string().min(1).max(50),
  suggestedQuantity: z.number().int().positive().default(1),
  revenueCents: z.number().int().nonnegative().default(0),
  headline: z.string().max(140).optional(),
  reason: z.string().max(280).optional(),
});

export const recurringSettingsSchema = z.object({
  interval: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
  endDate: z.string().datetime().optional(),
  preferredDay: z.string().optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional(),
});

export const createOrderSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  serviceType: serviceType,
  eventDate: z.string().datetime('Invalid date format — use ISO 8601'),
  headcount: z.number().int().positive('Headcount must be at least 1').max(10000, 'Headcount exceeds maximum'),
  packages: z.array(selectedPackageSchema).min(1, 'At least one package is required'),
  addOns: z.array(selectedAddOnSchema).optional().default([]),
  upsellAttributions: z.array(upsellAttributionSchema).optional().default([]),
  customer: customerInfoSchema,
  deliveryAddress: deliveryAddressSchema.optional(),
  recurring: recurringSettingsSchema.optional(),
  notes: z.string().max(2000).trim().optional(),
}).refine(
  (data) => !(data.serviceType === 'delivery' && !data.deliveryAddress),
  { message: 'Delivery address is required for delivery orders', path: ['deliveryAddress'] },
).refine(
  (data) => new Date(data.eventDate) > new Date(),
  { message: 'Event date must be in the future', path: ['eventDate'] },
).refine(
  (data) => {
    const ids = data.packages.map((p) => p.packageId);
    return new Set(ids).size === ids.length;
  },
  { message: 'Duplicate package selections are not allowed', path: ['packages'] },
).refine(
  (data) => {
    if (!data.addOns || data.addOns.length === 0) return true;
    const ids = data.addOns.map((a) => a.addOnId);
    return new Set(ids).size === ids.length;
  },
  { message: 'Duplicate add-on selections are not allowed', path: ['addOns'] },
).refine(
  (data) => {
    if (!data.upsellAttributions || data.upsellAttributions.length === 0) return true;
    const ids = data.upsellAttributions.map((entry) => entry.addOnId);
    return new Set(ids).size === ids.length;
  },
  { message: 'Duplicate upsell attributions are not allowed', path: ['upsellAttributions'] },
);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// --- Merchant dashboard ---

export const orderStatus = z.enum([
  'submitted',
  'awaiting_deposit',
  'confirmed',
  'completed',
  'cancelled',
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatus,
  reason: z.string().min(1, 'Reason is required when cancelling').max(500).trim().optional(),
}).refine(
  (data) => !(data.status === 'cancelled' && !data.reason),
  { message: 'Reason is required when cancelling an order', path: ['reason'] },
);

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const orderListQuerySchema = z.object({
  status: orderStatus.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const sendDepositLinkSchema = z.object({
  depositAmount: z.number().int().positive().optional(),
});

export type SendDepositLinkInput = z.infer<typeof sendDepositLinkSchema>;

export const reorderSchema = z.object({
  eventDate: z.string().datetime('Invalid date format — use ISO 8601'),
  headcount: z.number().int().positive().optional(),
  notes: z.string().max(2000).trim().optional(),
}).refine(
  (data) => new Date(data.eventDate) > new Date(),
  { message: 'Event date must be in the future', path: ['eventDate'] },
);

export type ReorderInput = z.infer<typeof reorderSchema>;
