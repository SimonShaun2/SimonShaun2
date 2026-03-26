import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from './customers.schema.js';
import * as service from './customers.service.js';

export function registerRoutes(app: FastifyInstance) {
  // All customer routes require auth + tenant context
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const customers = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: customers };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const customer = await service.getById(id);
    return { data: customer };
  });

  app.post('/', { preHandler: [validateBody(createCustomerSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updateCustomerSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
