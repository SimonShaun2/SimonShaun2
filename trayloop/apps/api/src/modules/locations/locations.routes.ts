import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createLocationSchema, updateLocationSchema } from './locations.schema.js';
import * as service from './locations.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const locations = await service.listByOrg(orgId);
    return { data: locations };
  });

  app.get('/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const location = await service.getById(id);
    return { data: location };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createLocationSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [requireAuth, validateBody(updateLocationSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
