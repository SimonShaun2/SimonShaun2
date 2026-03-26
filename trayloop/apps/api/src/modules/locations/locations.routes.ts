import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createLocationSchema, updateLocationSchema } from './locations.schema.js';
import * as service from './locations.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const locations = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: locations };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const location = await service.getById(id);
    return { data: location };
  });

  app.post('/', { preHandler: [validateBody(createLocationSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updateLocationSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
