import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './recurring-orders.routes.js';

export async function recurringOrdersModule(app: FastifyInstance) {
  registerRoutes(app);
}
