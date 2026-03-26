import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './organizations.routes.js';

export async function organizationsModule(app: FastifyInstance) {
  registerRoutes(app);
}
