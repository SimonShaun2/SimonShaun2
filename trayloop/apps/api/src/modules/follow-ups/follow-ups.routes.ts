import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createFollowUpSchema } from './follow-ups.schema.js';
import * as service from './follow-ups.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const followUps = await service.listByOrg(orgId);
    return { data: followUps };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createFollowUpSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.post('/:id/complete', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.markComplete(id);
    return reply.send({ data: { message: 'Completed' } });
  });
}
