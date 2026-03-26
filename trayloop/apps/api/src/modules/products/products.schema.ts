import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().default(''),
  price: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  imageUrl: z.string().url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
