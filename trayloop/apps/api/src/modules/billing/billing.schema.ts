import { z } from 'zod';

export const invoiceStatus = z.enum(['draft', 'sent', 'paid', 'overdue', 'void']);

export const createInvoiceSchema = z.object({
  orgId: z.string(),
  customerId: z.string(),
  orderId: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().int().nonnegative(),
  })).min(1),
  dueDate: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
