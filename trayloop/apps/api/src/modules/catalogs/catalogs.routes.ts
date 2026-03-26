import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createCatalogItemSchema, updateCatalogItemSchema } from './catalogs.schema.js';
import * as service from './catalogs.service.js';

export function registerRoutes(app: FastifyInstance) {
  // All catalog routes require auth + tenant context
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const items = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: items };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const item = await service.getById(id);
    return { data: item };
  });

  app.post('/', { preHandler: [validateBody(createCatalogItemSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updateCatalogItemSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.archive(id);
    return reply.status(204).send();
  });
}
