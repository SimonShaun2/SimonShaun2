import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody, validateParams } from '../../lib/middleware/validate.js';
import { idParamsSchema } from '../../lib/params.js';
import { createAddOnSchema, updateAddOnSchema } from './add-ons.schema.js';
import * as service from './add-ons.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/', async (request) => {
    const result = await service.listByOrg(request.ctx.tenant!.organizationId);
    return { data: result };
  });

  app.post('/', { preHandler: [validateBody(createAddOnSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.tenant!.organizationId, request.validatedBody as z.infer<typeof createAddOnSchema>);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [validateParams(idParamsSchema), validateBody(updateAddOnSchema)] }, async (request, reply) => {
    const { id } = request.validatedParams as z.infer<typeof idParamsSchema>;
    const result = await service.update(id, request.validatedBody as z.infer<typeof updateAddOnSchema>);
    return reply.send({ data: result });
  });
}
