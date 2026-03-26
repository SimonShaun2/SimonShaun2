import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './packages.routes.js';

export async function packagesModule(app: FastifyInstance) {
  registerRoutes(app);
}
