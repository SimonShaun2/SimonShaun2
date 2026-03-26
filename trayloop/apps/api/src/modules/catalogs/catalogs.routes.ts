import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createCatalogItemSchema, updateCatalogItemSchema } from './catalogs.schema.js';
import * as service from './catalogs.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', async (request) => {
    const { orgId } = request.params as { orgId: string };
    const items = await service.listByOrg(orgId);
    return { data: items };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const item = await service.getById(id);
    return { data: item };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createCatalogItemSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [requireAuth, validateBody(updateCatalogItemSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.archive(id);
    return reply.status(204).send();
  });
}
