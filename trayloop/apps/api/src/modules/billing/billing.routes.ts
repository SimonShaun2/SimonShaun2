import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireOrgAdmin, requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { billingCheckoutSchema, billingPortalSchema } from './billing.schema.js';
import * as service from './billing.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/subscription', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const subscription = await service.getSubscription(request.ctx.tenant!.organizationId);
    return { data: subscription };
  });

  app.post('/checkout', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(billingCheckoutSchema)] }, async (request, reply) => {
    const result = await service.createCheckoutSession(
      request.ctx.tenant!.organizationId,
      request.validatedBody,
    );
    return reply.status(201).send({ data: result });
  });

  app.post('/portal', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(billingPortalSchema)] }, async (request, reply) => {
    const result = await service.createPortalSession(
      request.ctx.tenant!.organizationId,
      request.validatedBody,
    );
    return reply.status(201).send({ data: result });
  });
}
