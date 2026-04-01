import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { ForbiddenError } from '../../lib/errors.js';
import * as service from './admin.service.js';

async function requirePlatformAdmin(request: FastifyRequest, _reply: FastifyReply) {
  if (request.ctx?.user?.role !== 'admin') {
    throw new ForbiddenError('Platform admin access required');
  }
}

export function registerRoutes(app: FastifyInstance) {
  // All admin routes require auth + platform admin role
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requirePlatformAdmin);

  app.get('/organizations', async (request) => {
    const orgs = await service.listOrganizations();
    return { data: orgs };
  });

  // ADM-004: Restaurant directory with health, GMV, owner data
  app.get('/restaurants', async (request) => {
    const restaurants = await service.listRestaurantDirectory();
    return { data: restaurants };
  });

  app.get('/users', async (request) => {
    const users = await service.listUsers();
    return { data: users };
  });

  app.get('/stats', async (request) => {
    const stats = await service.getPlatformStats();
    return { data: stats };
  });

  // ADM-002: Consolidated platform overview for master dashboard
  app.get('/overview', async (request) => {
    const overview = await service.getPlatformOverview();
    return { data: overview };
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
