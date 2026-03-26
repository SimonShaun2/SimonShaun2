import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createRecurringOrderSchema, updateRecurringOrderSchema } from './recurring-orders.schema.js';
import * as service from './recurring-orders.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const orders = await service.listByOrg(orgId);
    return { data: orders };
  });

  app.get('/customer/:customerId', { preHandler: [requireAuth] }, async (request) => {
    const { customerId } = request.params as { customerId: string };
    const orders = await service.listByCustomer(customerId);
    return { data: orders };
  });

  app.get('/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const order = await service.getById(id);
    return { data: order };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createRecurringOrderSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [requireAuth, validateBody(updateRecurringOrderSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.post('/:id/cancel', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.cancel(id, (app as any).eventBus);
    return reply.send({ data: { message: 'Cancelled' } });
  });
}
