import type { FastifyRequest, FastifyReply } from 'fastify';
import { db, users } from '@trayloop/database';
import { verifyToken } from '@trayloop/auth';
import { eq } from 'drizzle-orm';
import { UnauthorizedError } from '../errors.js';
import type { AuthUser } from '../context.js';
import { getSessionTokenFromRequest } from '../auth-cookies.js';

async function authenticateRequest(request: FastifyRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : getSessionTokenFromRequest(request);

  if (!token) {
    return null;
  }
  const payload = await verifyToken(token);

  const [userRecord] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!userRecord || !userRecord.isActive) {
    throw new UnauthorizedError('Account is inactive or no longer exists');
  }

  return {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
    supportOrganizationId: payload.supportOrganizationId,
    supportMemberRole: payload.supportMemberRole,
  };
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.headers.authorization?.startsWith('Bearer ') && !getSessionTokenFromRequest(request)) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  try {
    const user = await authenticateRequest(request);
    if (!user) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }
    request.ctx = { user };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const user = await authenticateRequest(request);
    if (user) {
      request.ctx = { user };
    }
  } catch {
    // Treat invalid public-session tokens as anonymous so guest checkout still works.
  }
}
