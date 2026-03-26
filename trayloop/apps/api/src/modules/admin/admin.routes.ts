import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import * as service from './admin.service.js';

export function registerRoutes(app: FastifyInstance) {
  // All admin routes require auth + admin role check
  app.addHook('preHandler', requireAuth);

  app.get('/organizations', async (request) => {
    const orgs = await service.listOrganizations();
    return { data: orgs };
  });

  app.get('/users', async (request) => {
    const users = await service.listUsers();
    return { data: users };
  });

  app.get('/stats', async (request) => {
    const stats = await service.getPlatformStats();
    return { data: stats };
  });

  app.patch('/organizations/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const result = await service.updateOrgStatus(id, status);
    return reply.send({ data: result });
  });

  app.patch('/users/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const result = await service.updateUserStatus(id, status);
    return reply.send({ data: result });
  });
}
