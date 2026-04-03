import { z } from 'zod';

const idSchema = z.string().uuid();
const statusSchema = z.string().trim().min(1).max(32).regex(/^[a-z_]+$/i, 'Status must contain only letters and underscores');

export const adminStatusParamsSchema = z.object({
  id: idSchema,
});

export const adminStatusBodySchema = z.object({
  status: statusSchema,
});
