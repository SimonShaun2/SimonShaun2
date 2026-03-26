import type { FastifyInstance } from 'fastify';
import { validateBody } from '../../lib/middleware/validate.js';
import { requireAuth } from '../../lib/middleware/auth.js';
import { createOrderSchema } from './orders.schema.js';
import * as service from './orders.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [requireAuth] }, async (request) => {
    const orders = await service.listOrders((request as any).user.sub);
    return { data: orders };
  });

  app.get('/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const order = await service.getOrder(id);
    return { data: order };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createOrderSchema)] }, async (request, reply) => {
    const order = await service.createOrder((request as any).user.sub, (request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: order });
  });
}
