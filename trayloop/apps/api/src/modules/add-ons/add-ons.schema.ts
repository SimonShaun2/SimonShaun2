import { z } from 'zod';

const imageUrlSchema = z.string().trim().refine((value) => {
  if (value.startsWith('http://') || value.startsWith('https://')) return true;
  if (!value.startsWith('data:image/')) return false;
  return /^(data:image\/(?:png|jpeg|jpg|webp);base64,).+/i.test(value);
}, 'Image must be an https URL or a PNG/JPEG/WebP upload.');

export const createAddOnSchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: imageUrlSchema.optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  upsellEligible: z.boolean().default(true),
  upsellFeatured: z.boolean().default(false),
  upsellPriority: z.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const updateAddOnSchema = createAddOnSchema.omit({ catalogId: true }).partial();

export type CreateAddOnInput = z.infer<typeof createAddOnSchema>;
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>;
