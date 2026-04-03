import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { paymentCheckoutSchema, paymentOrderParamsSchema } from './payments.schema.js';
import * as service from './payments.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.post('/checkout', { preHandler: [requireAuth, requireTenant, validateBody(paymentCheckoutSchema)] }, async (request, reply) => {
    const { orderId } = (request as any).validatedBody as { orderId: string };
    const result = await service.createCheckout(orderId, (app as any).eventBus);
    return reply.send({ data: result });
  });

  app.get('/order/:orderId', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const { orderId } = paymentOrderParamsSchema.parse(request.params);
    const payments = await service.listByOrder(orderId);
    return { data: payments };
  });
}
