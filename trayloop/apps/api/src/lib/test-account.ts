import { db, organizations } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from './errors.js';

export async function isTestAccount(orgId: string): Promise<boolean> {
  const [row] = await db
    .select({ isTestAccount: organizations.isTestAccount })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return row?.isTestAccount === true;
}

export function requireNotTestAccount() {
  return async function testAccountGuard(request: FastifyRequest, _reply: FastifyReply) {
    const organizationId = request.ctx?.tenant?.organizationId;
    if (!organizationId) return;

    if (await isTestAccount(organizationId)) {
      throw new ForbiddenError('This operation is not available for test accounts.');
    }
  };
}
