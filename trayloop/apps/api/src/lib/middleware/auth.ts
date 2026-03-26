import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@trayloop/auth';
import { UnauthorizedError } from '../errors.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token);
    (request as any).user = payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
