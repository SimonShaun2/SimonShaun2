import type { FastifyInstance } from 'fastify';
import { validateBody } from '../../lib/middleware/validate.js';
import { requireAuth } from '../../lib/middleware/auth.js';
import {
  registerSchema,
  customerRegisterSchema,
  loginSchema,
  refreshSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from './auth.schema.js';
import * as service from './auth.service.js';

export function registerRoutes(app: FastifyInstance) {
  // Public routes
  app.post('/register', { preHandler: [validateBody(registerSchema)] }, async (request, reply) => {
    const result = await service.register((request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.post('/register/customer', { preHandler: [validateBody(customerRegisterSchema)] }, async (request, reply) => {
    const result = await service.registerCustomer((request as any).validatedBody, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });

  app.post('/login', { preHandler: [validateBody(loginSchema)] }, async (request, reply) => {
    const result = await service.login((request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.post('/refresh', { preHandler: [validateBody(refreshSchema)] }, async (request, reply) => {
    const { token } = (request as any).validatedBody;
    const result = await service.refreshToken(token);
    return reply.send({ data: result });
  });

  app.post('/password-reset/request', { preHandler: [validateBody(passwordResetRequestSchema)] }, async (request, reply) => {
    const result = await service.requestPasswordReset((request as any).validatedBody);
    return reply.send({ data: result });
  });

  app.post('/password-reset/confirm', { preHandler: [validateBody(passwordResetConfirmSchema)] }, async (request, reply) => {
    const result = await service.confirmPasswordReset((request as any).validatedBody);
    return reply.send({ data: result });
  });

  // Protected routes
  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    const result = await service.getMe(request.ctx.user.id);
    return { data: result };
  });

  app.get('/customer/account', { preHandler: [requireAuth] }, async (request) => {
    const result = await service.getCustomerAccount(request.ctx.user.id);
    return { data: result };
  });

  app.post('/logout', async (_request, reply) => {
    // Stateless JWT — client discards the token
    return reply.send({ data: { message: 'Logged out' } });
  });
}
