import type { FastifyInstance } from 'fastify';
import { validateBody } from '../../lib/middleware/validate.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import * as service from './auth.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.post('/register', { preHandler: [validateBody(registerSchema)] }, async (request, reply) => {
    const result = await service.register((request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.post('/login', { preHandler: [validateBody(loginSchema)] }, async (request, reply) => {
    const result = await service.login((request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.post('/refresh', async (request, reply) => {
    // TODO: Token refresh
    return reply.send({ data: { message: 'Not implemented' } });
  });

  app.post('/logout', async (request, reply) => {
    // TODO: Session invalidation
    return reply.send({ data: { message: 'Logged out' } });
  });
}
