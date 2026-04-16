import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody, validateParams } from '../../lib/middleware/validate.js';
import { idParamsSchema } from '../../lib/params.js';
import { createCustomerSchema, updateCustomerSchema, customerListQuerySchema } from './customers.schema.js';
import * as service from './customers.service.js';

export function registerRoutes(app: FastifyInstance) {
  // All customer routes require auth + tenant context
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const query = customerListQuerySchema.parse(request.query);
    const result = await service.listByOrg(request.ctx.tenant!.organizationId, query);
    return {
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.hasMore,
      },
    };
  });

  app.get('/:id', { preHandler: [validateParams(idParamsSchema)] }, async (request) => {
    const { id } = (request as any).validatedParams as { id: string };
    const customer = await service.getById(id, request.ctx.tenant!.organizationId);
    return { data: customer };
  });

  app.post('/', { preHandler: [validateBody(createCustomerSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateParams(idParamsSchema), validateBody(updateCustomerSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const result = await service.update(id, request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
