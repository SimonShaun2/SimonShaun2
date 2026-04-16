import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './orders.routes.js';
import { registerEventHandlers } from './orders.events.js';

export async function ordersModule(app: FastifyInstance) {
  registerRoutes(app);
  registerEventHandlers(app.eventBus);
}
