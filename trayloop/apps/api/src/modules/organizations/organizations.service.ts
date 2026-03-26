import { db } from '@trayloop/database';
import { organizations, organizationMemberships } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreateOrganizationInput, UpdateOrganizationInput } from './organizations.schema.js';

export async function create(userId: string, input: CreateOrganizationInput) {
  // Check slug uniqueness
  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, input.slug))
    .limit(1);

  if (existing) {
    throw new ValidationError('Organization slug already taken');
  }

  const [org] = await db
    .insert(organizations)
    .values({
      ...input,
      ownerId: userId,
    })
    .returning();

  // Auto-create owner membership
  await db.insert(organizationMemberships).values({
    userId,
    organizationId: org.id,
    role: 'owner',
    status: 'active',
    joinedAt: new Date(),
  });

  return org;
}

export async function getById(id: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Organization');
  }

  return org;
}

export async function update(id: string, input: UpdateOrganizationInput) {
  if (input.slug) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, input.slug))
      .limit(1);

    if (existing && existing.id !== id) {
      throw new ValidationError('Organization slug already taken');
    }
  }

  const [updated] = await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError('Organization');
  }

  return updated;
}
