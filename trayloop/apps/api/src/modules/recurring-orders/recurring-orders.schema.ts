import { z } from 'zod';

export const recurrenceInterval = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']);

export const createRecurringOrderSchema = z.object({
  customerId: z.string(),
  locationId: z.string().optional(),
  packageId: z.string(),
  interval: recurrenceInterval,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  preferredDay: z.string().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

export const updateRecurringOrderSchema = createRecurringOrderSchema.omit({ customerId: true }).partial();

export type CreateRecurringOrderInput = z.infer<typeof createRecurringOrderSchema>;
export type UpdateRecurringOrderInput = z.infer<typeof updateRecurringOrderSchema>;
