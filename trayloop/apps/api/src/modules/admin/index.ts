import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './admin.routes.js';

export async function adminModule(app: FastifyInstance) {
  registerRoutes(app);
}
