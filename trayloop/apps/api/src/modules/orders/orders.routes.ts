import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from './orders.schema.js';
import * as service from './orders.service.js';

export function registerRoutes(app: FastifyInstance) {
  // All order routes require auth + tenant context
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const orders = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: orders };
  });

  app.get('/customer/:customerId', async (request) => {
    const { customerId } = request.params as { customerId: string };
    const orders = await service.listByCustomer(customerId);
    return { data: orders };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const order = await service.getById(id);
    return { data: order };
  });

  app.post('/', { preHandler: [validateBody(createOrderSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, (request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id/status', { preHandler: [validateBody(updateOrderStatusSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.updateStatus(id, (request as any).validatedBody, (app as any).eventBus);
    return reply.send({ data: result });
  });
}
