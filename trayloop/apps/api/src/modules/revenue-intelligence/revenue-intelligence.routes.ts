import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { revenueInsightEventSchema, revenueSummaryQuerySchema } from './revenue-intelligence.schema.js';
import * as service from './revenue-intelligence.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/summary', async (request) => {
    const query = revenueSummaryQuerySchema.parse(request.query);
    const data = await service.getRevenueIntelligenceSummary(request.ctx.tenant!.organizationId, query.range);
    return { data };
  });

  app.get('/report', async (request) => {
    const query = revenueSummaryQuerySchema.parse(request.query);
    const data = await service.getRevenueIntelligenceReport(request.ctx.tenant!.organizationId, query.range);
    return { data };
  });

  app.post('/events', { preHandler: [validateBody(revenueInsightEventSchema)] }, async (request, reply) => {
    await service.trackRevenueInsightEvent(
      request.ctx.tenant!.organizationId,
      request.ctx.user.id,
      (request as any).validatedBody,
    );
    return reply.status(201).send({ ok: true });
  });
}
