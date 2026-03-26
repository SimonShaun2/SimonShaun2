import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@trayloop/auth';
import { UnauthorizedError } from '../errors.js';
import type { AuthUser } from '../context.js';

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token);
    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    request.ctx = { user };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
