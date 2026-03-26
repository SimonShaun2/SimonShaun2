import { db } from '@trayloop/database';
import { organizationMemberships, users } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { InviteMemberInput, UpdateMemberRoleInput } from './memberships.schema.js';

export async function listByOrg(orgId: string) {
  const rows = await db
    .select({
      id: organizationMemberships.id,
      role: organizationMemberships.role,
      status: organizationMemberships.status,
      joinedAt: organizationMemberships.joinedAt,
      createdAt: organizationMemberships.createdAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .where(eq(organizationMemberships.organizationId, orgId));

  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    status: r.status,
    joinedAt: r.joinedAt,
    createdAt: r.createdAt,
    user: {
      id: r.userId,
      name: r.userName,
      email: r.userEmail,
    },
  }));
}

export async function invite(orgId: string, input: InviteMemberInput) {
  // Find user by email
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new ValidationError(`No user found with email ${input.email}`);
  }

  // Check if already a member
  const [existing] = await db
    .select({ id: organizationMemberships.id })
    .from(organizationMemberships)
    .where(and(
      eq(organizationMemberships.userId, user.id),
      eq(organizationMemberships.organizationId, orgId),
    ))
    .limit(1);

  if (existing) {
    throw new ValidationError('User is already a member of this organization');
  }

  const [membership] = await db
    .insert(organizationMemberships)
    .values({
      userId: user.id,
      organizationId: orgId,
      role: input.role ?? 'staff',
      status: 'invited',
    })
    .returning();

  return {
    id: membership.id,
    role: membership.role,
    status: membership.status,
    user: { id: user.id, email: input.email },
  };
}

export async function updateRole(id: string, input: UpdateMemberRoleInput) {
  const [membership] = await db
    .select({
      id: organizationMemberships.id,
      role: organizationMemberships.role,
    })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.id, id))
    .limit(1);

  if (!membership) throw new NotFoundError('Membership');

  if (membership.role === 'owner') {
    throw new ValidationError('Cannot change the role of the organization owner');
  }

  const [updated] = await db
    .update(organizationMemberships)
    .set({ role: input.role, updatedAt: new Date() })
    .where(eq(organizationMemberships.id, id))
    .returning();

  return { id: updated.id, role: updated.role, status: updated.status };
}

export async function remove(id: string) {
  const [membership] = await db
    .select({ role: organizationMemberships.role })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.id, id))
    .limit(1);

  if (!membership) throw new NotFoundError('Membership');

  if (membership.role === 'owner') {
    throw new ValidationError('Cannot remove the organization owner');
  }

  await db
    .update(organizationMemberships)
    .set({ status: 'removed', updatedAt: new Date() })
    .where(eq(organizationMemberships.id, id));

  return { id, status: 'removed' };
}
