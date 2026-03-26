import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from './customers.schema.js';
import * as service from './customers.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const customers = await service.listByOrg(orgId);
    return { data: customers };
  });

  app.get('/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const customer = await service.getById(id);
    return { data: customer };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createCustomerSchema)] }, async (request, reply) => {
    const result = await service.create((request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  app.patch('/:id', { preHandler: [requireAuth, validateBody(updateCustomerSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.update(id, (request as any).validatedBody);
    return reply.send({ data: result });
  });
}
