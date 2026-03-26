import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createPackageSchema, updatePackageSchema } from './packages.schema.js';
import * as service from './packages.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', async (request) => {
    const { orgId } = request.params as { orgId: string };
    const packages = await service.listByOrg(orgId);
    return { data: packages };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const pkg = await service.getById(id);
    return { data: pkg };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createPackageSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [requireAuth, validateBody(updatePackageSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
