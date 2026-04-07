import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody, validateParams } from '../../lib/middleware/validate.js';
import { idParamsSchema } from '../../lib/params.js';
import { inviteMemberSchema, updateMemberRoleSchema } from './memberships.schema.js';
import * as service from './memberships.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const members = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: members };
  });

  app.post('/invite', { preHandler: [validateBody(inviteMemberSchema)] }, async (request, reply) => {
    const body = (request as any).validatedBody;
    const result = await service.invite(request.ctx.tenant!.organizationId, body);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id/role', { preHandler: [validateParams(idParamsSchema), validateBody(updateMemberRoleSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const result = await service.updateRole(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.delete('/:id', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    await service.remove(id);
    return reply.status(204).send();
  });
}
