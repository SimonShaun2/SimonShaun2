import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createToken } from '@trayloop/auth';
import { requireAuth } from '../../lib/middleware/auth.js';
import { ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { setSessionCookie } from '../../lib/auth-cookies.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { isAutomationsEnabled } from '../../lib/features.js';
import { adminCreateTestAccountSchema, adminStatusBodySchema, adminStatusParamsSchema } from './admin.schema.js';
import { revenueSummaryQuerySchema } from '../revenue-intelligence/revenue-intelligence.schema.js';
import * as service from './admin.service.js';

async function requirePlatformAdmin(request: FastifyRequest, _reply: FastifyReply) {
  if (request.ctx?.user?.role !== 'admin') {
    throw new ForbiddenError('Platform admin access required');
  }
}

export function registerRoutes(app: FastifyInstance) {
  const automationsEnabled = isAutomationsEnabled();
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requirePlatformAdmin);

  app.get('/organizations', async () => {
    const orgs = await service.listOrganizations();
    return { data: orgs };
  });

  app.get('/restaurants', async () => {
    const restaurants = await service.listRestaurantDirectory();
    return { data: restaurants };
  });

  app.post('/organizations/:id/support-session', async (request, reply) => {
    const { id } = adminStatusParamsSchema.parse(request.params);
    const organization = await service.getOrganizationSupportContext(id);

    if (!organization) {
      throw new NotFoundError('Organization');
    }

    if (!organization.isActive) {
      throw new ForbiddenError('This merchant workspace is inactive');
    }

    const user = request.ctx?.user;
    if (!user) {
      throw new ForbiddenError('Platform admin access required');
    }

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      supportOrganizationId: organization.id,
      supportMemberRole: 'admin',
    }, '8h');

    setSessionCookie(reply, token, 'merchant');

    return reply.send({
      data: {
        organization,
      },
    });
  });

  app.get('/users', async () => {
    const users = await service.listUsers();
    return { data: users };
  });

  app.post('/test-accounts', { preHandler: [validateBody(adminCreateTestAccountSchema)] }, async (request, reply) => {
    const result = await service.createTestAccount((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.get('/stats', async () => {
    const stats = await service.getPlatformStats();
    return { data: stats };
  });

  app.get('/overview', async () => {
    const overview = await service.getPlatformOverview();
    return { data: overview };
  });

  // ADM-005: Trial conversions intelligence
  app.get('/trial-conversions', async (request) => {
    const data = await service.getTrialConversions();
    return { data };
  });

  // ADM-005: MRR movement
  app.get('/mrr-movement', async (request) => {
    const data = await service.getMrrMovement();
    return { data };
  });

  // ADM-006
  app.get('/platform-health', async () => { return { data: await service.getPlatformHealth() }; });
  app.get('/revenue-forecast', async () => { return { data: await service.getRevenueForecast() }; });
  app.get('/churn-risk', async () => { return { data: await service.getChurnRisk() }; });
  app.get('/revenue-intelligence', async (request) => {
    const query = revenueSummaryQuerySchema.parse(request.query);
    return { data: await service.getRevenueIntelligence(query.range) };
  });
  if (automationsEnabled) {
    app.get('/automation-intelligence', async () => {
      return { data: await service.getAutomationIntelligence() };
    });
  }

  app.patch('/organizations/:id/status', { preHandler: [validateBody(adminStatusBodySchema)] }, async (request, reply) => {
    const { id } = adminStatusParamsSchema.parse(request.params);
    const { status } = (request as any).validatedBody as { status: string };
    const result = await service.updateOrgStatus(id, status);
    return reply.send({ data: result });
  });

  app.patch('/users/:id/status', { preHandler: [validateBody(adminStatusBodySchema)] }, async (request, reply) => {
    const { id } = adminStatusParamsSchema.parse(request.params);
    const { status } = (request as any).validatedBody as { status: string };
    const result = await service.updateUserStatus(id, status);
    return reply.send({ data: result });
  });
}
