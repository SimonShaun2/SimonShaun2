import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createCatalogSchema, createCategorySchema } from './catalogs.schema.js';
import * as service from './catalogs.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  // --- Catalogs ---

  app.get('/', async (request) => {
    const result = await service.listCatalogs(request.ctx.tenant!.organizationId);
    return { data: result };
  });

  app.post('/', { preHandler: [validateBody(createCatalogSchema)] }, async (request, reply) => {
    const result = await service.createCatalog(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  // --- Categories ---

  app.get('/categories', async (request) => {
    const result = await service.listCategories(request.ctx.tenant!.organizationId);
    return { data: result };
  });

  app.post('/categories', { preHandler: [validateBody(createCategorySchema)] }, async (request, reply) => {
    const result = await service.createCategory(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  // --- Full menu tree ---

  app.get('/menu', async (request) => {
    const result = await service.getFullMenu(request.ctx.tenant!.organizationId);
    return { data: result };
  });
}
