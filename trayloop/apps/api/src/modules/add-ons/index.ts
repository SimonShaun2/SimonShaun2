import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './add-ons.routes.js';

export async function addOnsModule(app: FastifyInstance) {
  registerRoutes(app);
}
