import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant, requireOrgAdmin } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createOrganizationSchema, updateOrganizationSchema } from './organizations.schema.js';
import * as service from './organizations.service.js';

export function registerRoutes(app: FastifyInstance) {
  // List organizations the authenticated user belongs to
  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    const orgs = await service.listByUser(request.ctx.user.id);
    return { data: orgs };
  });

  // Create a new organization (authenticated user becomes owner)
  app.post('/', { preHandler: [requireAuth, validateBody(createOrganizationSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.user.id, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  // Get current organization (from tenant context)
  app.get('/current', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const org = await service.getById(request.ctx.tenant!.organizationId);
    return { data: org };
  });

  // Get setup status for onboarding checklist
  app.get('/current/setup-status', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const status = await service.getSetupStatus(request.ctx.tenant!.organizationId);
    return { data: status };
  });

  // Update current organization (requires owner/admin)
  app.patch('/current', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(updateOrganizationSchema)] }, async (request, reply) => {
    const result = await service.update(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
