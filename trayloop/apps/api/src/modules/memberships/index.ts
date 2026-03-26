import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './memberships.routes.js';

export async function membershipsModule(app: FastifyInstance) {
  registerRoutes(app);
}
