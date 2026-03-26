import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant, requireOrgAdmin } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createOrganizationSchema, updateOrganizationSchema } from './organizations.schema.js';
import * as service from './organizations.service.js';

export function registerRoutes(app: FastifyInstance) {
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

  // Get organization by ID (must be a member)
  app.get('/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const org = await service.getById(id);
    return { data: org };
  });

  // Update organization (requires owner/admin role in the org)
  app.patch('/', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(updateOrganizationSchema)] }, async (request, reply) => {
    const result = await service.update(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
