import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@trayloop/auth';
import { UnauthorizedError } from '../errors.js';
import type { AuthUser } from '../context.js';

async function authenticateRequest(request: FastifyRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.headers.authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  try {
    const user = await authenticateRequest(request);
    if (!user) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }
    request.ctx = { user };
  } catch {
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
