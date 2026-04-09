import { z } from 'zod';

const optionalUrlOrDataImage = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.startsWith('http://')
      || value.startsWith('https://')
      || /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/i.test(value),
    'Must be a valid image URL or uploaded image data',
  )
  .optional();

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  logoUrl: optionalUrlOrDataImage,
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  displayFont: z.enum(['bricolage', 'fraunces', 'inter']).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
