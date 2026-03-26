import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createFollowUpSchema } from './follow-ups.schema.js';
import * as service from './follow-ups.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const followUps = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: followUps };
  });

  app.post('/', { preHandler: [validateBody(createFollowUpSchema)] }, async (request, reply) => {
    const body = (request as any).validatedBody;
    const result = await service.create({ ...body, orgId: request.ctx.tenant!.organizationId });
    return reply.status(201).send({ data: result });
  });

  app.post('/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.markComplete(id);
    return reply.send({ data: { message: 'Completed' } });
  });
}
