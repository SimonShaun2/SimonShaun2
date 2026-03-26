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
    await service.handleWebhook(request, (app as any).eventBus);
    return reply.status(200).send({ received: true });
  });
}
