import { z } from 'zod';

// --- Catalogs ---
export const createCatalogSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateCatalogSchema = createCatalogSchema.partial();

export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;

// --- Categories ---
export const createCategorySchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const updateCategorySchema = createCategorySchema.omit({ catalogId: true }).partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
