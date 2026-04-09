import { z } from 'zod';

const imageUrlSchema = z.string().trim().refine((value) => {
  if (value.startsWith('http://') || value.startsWith('https://')) return true;
  if (!value.startsWith('data:image/')) return false;
  return /^(data:image\/(?:png|jpeg|jpg|webp);base64,).+/i.test(value);
}, 'Image must be an https URL or a PNG/JPEG/WebP upload.');

export const createPackageSchema = z.object({
  catalogId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  pricePerHead: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  minimumHeadcount: z.number().int().positive().default(1),
  maximumHeadcount: z.number().int().positive().optional(),
  imageUrl: imageUrlSchema.optional(),
  upsellEligible: z.boolean().default(false),
  upsellFeatured: z.boolean().default(false),
  upsellPriority: z.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

export const updatePackageSchema = createPackageSchema.omit({ catalogId: true }).partial();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
