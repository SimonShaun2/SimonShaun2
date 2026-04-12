import { z } from 'zod';
import { PLAN_KEYS } from '@trayloop/types';

export const billingCheckoutSchema = z.object({
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  includeGrowthAdvisor: z.boolean().optional(),
  plan: z.enum(PLAN_KEYS).optional(),
});

export const billingPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export type BillingCheckoutInput = z.infer<typeof billingCheckoutSchema>;
export type BillingPortalInput = z.infer<typeof billingPortalSchema>;
