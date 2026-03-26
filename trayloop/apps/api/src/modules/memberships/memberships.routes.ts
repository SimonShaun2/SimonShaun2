import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { inviteMemberSchema, updateMemberRoleSchema } from './memberships.schema.js';
import * as service from './memberships.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const members = await service.listByOrg(orgId);
    return { data: members };
  });

  app.post('/invite', { preHandler: [requireAuth, validateBody(inviteMemberSchema)] }, async (request, reply) => {
    const result = await service.invite((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id/role', { preHandler: [requireAuth, validateBody(updateMemberRoleSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.updateRole(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.remove(id);
    return reply.status(204).send();
  });
}
