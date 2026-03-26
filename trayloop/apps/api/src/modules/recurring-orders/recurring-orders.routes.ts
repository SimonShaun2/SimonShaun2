import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createRecurringOrderSchema, updateRecurringOrderSchema } from './recurring-orders.schema.js';
import * as service from './recurring-orders.service.js';

export function registerRoutes(app: FastifyInstance) {
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

  app.post('/', { preHandler: [validateBody(createRecurringOrderSchema)] }, async (request, reply) => {
    const body = (request as any).validatedBody;
    const result = await service.create({ ...body, orgId: request.ctx.tenant!.organizationId }, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateBody(updateRecurringOrderSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.post('/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.cancel(id, (app as any).eventBus);
    return reply.send({ data: { message: 'Cancelled' } });
  });
}
