import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createPackageSchema, updatePackageSchema } from './packages.schema.js';
import * as service from './packages.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const packages = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: packages };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const pkg = await service.getById(id);
    return { data: pkg };
  });

  app.post('/', { preHandler: [validateBody(createPackageSchema)] }, async (request, reply) => {
    const body = (request as any).validatedBody;
    const result = await service.create({ ...body, orgId: request.ctx.tenant!.organizationId });
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updatePackageSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
