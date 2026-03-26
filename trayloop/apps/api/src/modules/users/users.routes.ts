import type { FastifyInstance } from 'fastify';
import { validateBody } from '../../lib/middleware/validate.js';
import { requireAuth } from '../../lib/middleware/auth.js';
import { registerSchema, loginSchema } from './users.schema.js';
import * as service from './users.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.post('/register', { preHandler: [validateBody(registerSchema)] }, async (request, reply) => {
    const result = await service.register((request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.post('/login', { preHandler: [validateBody(loginSchema)] }, async (request, reply) => {
    const result = await service.login((request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    const user = await service.getProfile((request as any).user.sub);
    return { data: user };
  });
}
