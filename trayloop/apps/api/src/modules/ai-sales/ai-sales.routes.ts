import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireAnyFeature, requireFeature } from '../../lib/feature-access.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import {
  createCampaignSchema,
  generateCampaignMessageSchema,
  listCampaignsQuerySchema,
  reorderOpportunitiesQuerySchema,
  reactivationTargetsQuerySchema,
} from './ai-sales.schema.js';
import * as service from './ai-sales.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/reactivation-summary', { preHandler: [requireFeature('campaigns.reactivation')] }, async (request) => {
    const data = await service.getReactivationSummary(request.ctx.tenant!.organizationId);
    return { data };
  });

  app.get('/reactivation-targets', { preHandler: [requireFeature('campaigns.reactivation')] }, async (request) => {
    const query = reactivationTargetsQuerySchema.parse(request.query);
    const result = await service.getReactivationTargets(request.ctx.tenant!.organizationId, query);
    return { data: result.targets, meta: result.pagination };
  });

  app.get('/reorder-opportunities', { preHandler: [requireFeature('reorder.basic')] }, async (request) => {
    const query = reorderOpportunitiesQuerySchema.parse(request.query);
    const result = await service.getReorderOpportunities(request.ctx.tenant!.organizationId, query);
    return { data: result.data, meta: result.meta };
  });

  app.post(
    '/generate-message',
    {
      preHandler: [
        validateBody(generateCampaignMessageSchema),
        requireAnyFeature(['campaigns.ai_email', 'campaigns.ai_sms', 'campaigns.reactivation']),
      ],
    },
    async (request) => {
      const result = await service.generateMessageForTargets(
        request.ctx.tenant!.organizationId,
        (request as any).validatedBody,
      );
      return { data: result };
    },
  );

  app.post(
    '/campaigns',
    {
      preHandler: [
        validateBody(createCampaignSchema),
        requireAnyFeature(['campaigns.ai_email', 'campaigns.ai_sms', 'campaigns.reactivation']),
      ],
    },
    async (request, reply) => {
      const result = await service.createCampaign(
        request.ctx.tenant!.organizationId,
        request.ctx.user.id,
        (request as any).validatedBody,
      );
      return reply.status(201).send({ data: result });
    },
  );

  app.get(
    '/campaigns',
    { preHandler: [requireAnyFeature(['campaigns.ai_email', 'campaigns.ai_sms', 'campaigns.reactivation'])] },
    async (request) => {
      const query = listCampaignsQuerySchema.parse(request.query);
      const result = await service.listCampaigns(request.ctx.tenant!.organizationId, query);
      return { data: result };
    },
  );
}
