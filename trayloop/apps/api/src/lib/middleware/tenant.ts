import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '@trayloop/database';
import { organizationMemberships } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { ForbiddenError, UnauthorizedError } from '../errors.js';

/**
 * Resolves the organization context from the x-organization-id header.
 * Verifies the authenticated user is an active member of that organization.
 * Attaches tenant context (organizationId + memberRole) to request.ctx.
 */
export async function requireTenant(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.ctx?.user) {
    throw new UnauthorizedError('Authentication required before tenant resolution');
  }

  const orgId = request.headers['x-organization-id'] as string | undefined;
  if (!orgId) {
    throw new ForbiddenError('Missing x-organization-id header');
  }

  const [membership] = await db
    .select({
      role: organizationMemberships.role,
      status: organizationMemberships.status,
    })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.userId, request.ctx.user.id),
        eq(organizationMemberships.organizationId, orgId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new ForbiddenError('You are not a member of this organization');
  }

  if (membership.status !== 'active') {
    throw new ForbiddenError(`Membership is ${membership.status}`);
  }

  request.ctx.tenant = {
    organizationId: orgId,
    memberRole: membership.role,
  };
}

/**
 * Requires tenant context + owner or admin role within the organization.
 * Must be used after requireAuth and requireTenant.
 */
export async function requireOrgAdmin(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.ctx?.tenant) {
    throw new ForbiddenError('Tenant context required');
  }

  const { memberRole } = request.ctx.tenant;
  if (memberRole !== 'owner' && memberRole !== 'admin') {
    throw new ForbiddenError('Owner or admin role required');
  }
}
