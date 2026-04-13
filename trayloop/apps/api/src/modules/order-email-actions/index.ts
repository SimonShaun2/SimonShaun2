import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './order-email-actions.routes.js';

export async function orderEmailActionsModule(app: FastifyInstance) {
  registerRoutes(app);
}
