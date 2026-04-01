import { z } from 'zod';

// --- Catalogs ---
export const createCatalogSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateCatalogSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;

// --- Categories ---
export const createCategorySchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
