import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireFeature } from '../../lib/feature-access.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { revenueInsightEventSchema, revenueSummaryQuerySchema } from './revenue-intelligence.schema.js';
import * as service from './revenue-intelligence.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/summary', { preHandler: [requireFeature('analytics.advanced')] }, async (request) => {
    const query = revenueSummaryQuerySchema.parse(request.query);
    const data = await service.getRevenueIntelligenceSummary(request.ctx.tenant!.organizationId, query.range);
    return { data };
  });

  app.get('/report', { preHandler: [requireFeature('analytics.advanced')] }, async (request) => {
    const query = revenueSummaryQuerySchema.parse(request.query);
    const data = await service.getRevenueIntelligenceReport(request.ctx.tenant!.organizationId, query.range);
    return { data };
  });

  app.post('/events', { preHandler: [validateBody(revenueInsightEventSchema), requireFeature('analytics.advanced')] }, async (request, reply) => {
    await service.trackRevenueInsightEvent(
      request.ctx.tenant!.organizationId,
      request.ctx.user.id,
      request.validatedBody as z.infer<typeof revenueInsightEventSchema>,
    );
    return reply.status(201).send({ ok: true });
  });
}
