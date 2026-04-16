import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { idParamsSchema } from '../../lib/params.js';
import { validateParams } from '../../lib/middleware/validate.js';
import * as service from './notifications.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/', async (request) => {
    const list = await service.listByUser(request.ctx.user.id);
    const unread = await service.unreadCount(request.ctx.user.id);
    return { data: list, meta: { unread } };
  });

  app.patch('/:id/read', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as { id: string };
    await service.markRead(id);
    return reply.send({ data: { message: 'Marked as read' } });
  });

  app.post('/mark-all-read', async (request, reply) => {
    await service.markAllRead(request.ctx.user.id);
    return reply.send({ data: { message: 'All marked as read' } });
  });
}
