import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './automations.routes.js';

export async function automationsModule(app: FastifyInstance) {
  registerRoutes(app);
}
