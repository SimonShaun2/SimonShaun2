import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import * as service from './notifications.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [requireAuth] }, async (request) => {
    const userId = (request as any).user.sub;
    const notifications = await service.listByUser(userId);
    return { data: notifications };
  });

  app.patch('/:id/read', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.markRead(id);
    return reply.send({ data: { message: 'Marked as read' } });
  });

  app.post('/mark-all-read', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = (request as any).user.sub;
    await service.markAllRead(userId);
    return reply.send({ data: { message: 'All marked as read' } });
  });
}
