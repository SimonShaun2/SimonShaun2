import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { clearSessionCookies, getSessionScopeForRole, setSessionCookie } from '../../lib/auth-cookies.js';
import { requireAuth } from '../../lib/middleware/auth.js';
import { validateBody } from '../../lib/middleware/validate.js';
import {
  customerRegisterSchema,
  loginSchema,
  merchantWorkspaceRegisterSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  refreshSchema,
  registerSchema,
} from './auth.schema.js';
import * as service from './auth.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.post('/register', { preHandler: [validateBody(registerSchema)] }, async (request, reply) => {
    const result = await service.register(request.validatedBody as z.infer<typeof registerSchema>, app.eventBus);
    setSessionCookie(reply, result.token, getSessionScopeForRole(result.user.role));
    return reply.status(201).send({ data: result });
  });

  app.post('/register/customer', { preHandler: [validateBody(customerRegisterSchema)] }, async (request, reply) => {
    const result = await service.registerCustomer(request.validatedBody as z.infer<typeof customerRegisterSchema>, app.eventBus);
    setSessionCookie(reply, result.token, getSessionScopeForRole(result.user.role));
    return reply.status(201).send({ data: result });
  });

  app.post('/register/merchant-workspace', { preHandler: [validateBody(merchantWorkspaceRegisterSchema)] }, async (request, reply) => {
    const result = await service.registerMerchantWorkspace(request.validatedBody as z.infer<typeof merchantWorkspaceRegisterSchema>, app.eventBus);
    setSessionCookie(reply, result.token, getSessionScopeForRole(result.user.role));
    return reply.status(201).send({ data: result });
  });

  app.post('/login', { preHandler: [validateBody(loginSchema)] }, async (request, reply) => {
    const result = await service.login(request.validatedBody as z.infer<typeof loginSchema>);
    setSessionCookie(reply, result.token, getSessionScopeForRole(result.user.role));
    return reply.send({ data: result });
  });

  app.post('/refresh', { preHandler: [validateBody(refreshSchema)] }, async (request, reply) => {
    const { token } = request.validatedBody as z.infer<typeof refreshSchema>;
    const result = await service.refreshToken(token);
    setSessionCookie(reply, result.token, getSessionScopeForRole(result.role));
    return reply.send({ data: result });
  });

  app.post('/password-reset/request', { preHandler: [validateBody(passwordResetRequestSchema)] }, async (request, reply) => {
    const result = await service.requestPasswordReset(request.validatedBody as z.infer<typeof passwordResetRequestSchema>);
    return reply.send({ data: result });
  });

  app.post('/password-reset/confirm', { preHandler: [validateBody(passwordResetConfirmSchema)] }, async (request, reply) => {
    const result = await service.confirmPasswordReset(request.validatedBody as z.infer<typeof passwordResetConfirmSchema>);
    return reply.send({ data: result });
  });

  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    const result = await service.getMe(request.ctx.user.id);
    return { data: result };
  });

  app.get('/customer/account', { preHandler: [requireAuth] }, async (request) => {
    const result = await service.getCustomerAccount(request.ctx.user.id);
    return { data: result };
  });

  app.post('/logout', async (_request, reply) => {
    clearSessionCookies(reply);
    return reply.send({ data: { message: 'Logged out' } });
  });
}
