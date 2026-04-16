import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
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
    const body = request.validatedBody as z.infer<typeof inviteMemberSchema>;
    const result = await service.invite(request.ctx.tenant!.organizationId, body);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id/role', { preHandler: [validateParams(idParamsSchema), validateBody(updateMemberRoleSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as z.infer<typeof idParamsSchema>;
    const result = await service.updateRole(id, request.validatedBody as z.infer<typeof updateMemberRoleSchema>);
    return reply.send({ data: result });
  });

  app.delete('/:id', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as z.infer<typeof idParamsSchema>;
    await service.remove(id);
    return reply.status(204).send();
  });
}
