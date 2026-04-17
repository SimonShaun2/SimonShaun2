import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './orders.routes.js';

export async function ordersModule(app: FastifyInstance) {
  registerRoutes(app);
}
