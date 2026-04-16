import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireFeature } from '../../lib/feature-access.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody, validateParams } from '../../lib/middleware/validate.js';
import { customerIdParamsSchema, idParamsSchema } from '../../lib/params.js';
import { createRecurringOrderSchema, updateRecurringOrderSchema } from './recurring-orders.schema.js';
import * as service from './recurring-orders.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);
  app.addHook('preHandler', requireFeature('orders.recurring_schedule'));

  app.get('/', async (request) => {
    const orders = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: orders };
  });

  app.get('/customer/:customerId', { preHandler: [validateParams(customerIdParamsSchema)] }, async (request) => {
    const { customerId } = request.validatedParams as { customerId: string };
    const orders = await service.listByCustomer(customerId);
    return { data: orders };
  });

  app.get('/:id', { preHandler: [validateParams(idParamsSchema)] }, async (request) => {
    const { id } = request.validatedParams as { id: string };
    const order = await service.getById(id);
    return { data: order };
  });

  app.post('/', { preHandler: [validateBody(createRecurringOrderSchema)] }, async (request, reply) => {
    const body = request.validatedBody;
    const result = await service.create({ ...body, orgId: request.ctx.tenant!.organizationId }, app.eventBus);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateParams(idParamsSchema), validateBody(updateRecurringOrderSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as { id: string };
    const result = await service.update(id, request.validatedBody);
    return reply.send({ data: result });
  });

  app.post('/:id/cancel', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as { id: string };
    await service.cancel(id, app.eventBus);
    return reply.send({ data: { message: 'Cancelled' } });
  });
}
