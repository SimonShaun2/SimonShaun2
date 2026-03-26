import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import * as service from './payments.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.post('/checkout', { preHandler: [requireAuth] }, async (request, reply) => {
    const { orderId } = request.body as { orderId: string };
    const result = await service.createCheckout(orderId, (app as any).eventBus);
    return reply.send({ data: result });
  });

  app.post('/webhooks/stripe', async (request, reply) => {
    await service.handleStripeWebhook(request, (app as any).eventBus);
    return reply.status(200).send({ received: true });
  });

  app.get('/order/:orderId', { preHandler: [requireAuth] }, async (request) => {
    const { orderId } = request.params as { orderId: string };
    const payments = await service.listByOrder(orderId);
    return { data: payments };
  });
}
