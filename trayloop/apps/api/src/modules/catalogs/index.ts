import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './catalogs.routes.js';

export async function catalogsModule(app: FastifyInstance) {
  registerRoutes(app);
}
