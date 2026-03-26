import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createFollowUpSchema, updateFollowUpSchema, followUpListQuerySchema } from './follow-ups.schema.js';
import * as service from './follow-ups.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const query = followUpListQuerySchema.parse(request.query);
    const result = await service.listByOrg(request.ctx.tenant!.organizationId, query);
    return { data: result.followUps, meta: result.pagination };
  });

  app.post('/', { preHandler: [validateBody(createFollowUpSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updateFollowUpSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
