import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './payments.routes.js';

export async function paymentsModule(app: FastifyInstance) {
  registerRoutes(app);
}
