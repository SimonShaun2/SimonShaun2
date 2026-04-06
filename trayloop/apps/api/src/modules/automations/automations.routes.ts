import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import {
  automationEvaluateSchema,
  automationProcessSchema,
  automationRuleUpdateSchema,
  automationRunsQuerySchema,
  automationRunUpdateSchema,
} from './automations.schema.js';
import * as service from './automations.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/overview', async (request) => {
    return { data: await service.getAutomationOverview(request.ctx.tenant!.organizationId, request.ctx.user.id) };
  });

  app.get('/rules', async (request) => {
    return { data: await service.listAutomationRules(request.ctx.tenant!.organizationId, request.ctx.user.id) };
  });

  app.patch('/rules/:id', { preHandler: [validateBody(automationRuleUpdateSchema)] }, async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: await service.updateAutomationRule(
        request.ctx.tenant!.organizationId,
        request.ctx.user.id,
        id,
        (request as any).validatedBody,
      ),
    };
  });

  app.post('/evaluate', { preHandler: [validateBody(automationEvaluateSchema)] }, async (request) => {
    return {
      data: await service.evaluateAutomationRules(
        request.ctx.tenant!.organizationId,
        request.ctx.user.id,
        (request as any).validatedBody,
      ),
    };
  });

  app.get('/runs', async (request) => {
    const query = automationRunsQuerySchema.parse(request.query);
    return { data: await service.listAutomationRuns(request.ctx.tenant!.organizationId, query) };
  });

  app.patch('/runs/:id', { preHandler: [validateBody(automationRunUpdateSchema)] }, async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: await service.updateAutomationRun(
        request.ctx.tenant!.organizationId,
        request.ctx.user.id,
        id,
        (request as any).validatedBody,
      ),
    };
  });

  app.post('/process', { preHandler: [validateBody(automationProcessSchema)] }, async (request) => {
    return {
      data: await service.processAutomationRuns(
        request.ctx.tenant!.organizationId,
        request.ctx.user.id,
        (request as any).validatedBody,
      ),
    };
  });
}
