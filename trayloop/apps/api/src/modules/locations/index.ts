import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './locations.routes.js';

export async function locationsModule(app: FastifyInstance) {
  registerRoutes(app);
}
