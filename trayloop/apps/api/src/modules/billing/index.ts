import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './billing.routes.js';

export async function billingModule(app: FastifyInstance) {
  registerRoutes(app);
}
