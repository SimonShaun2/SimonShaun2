import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './notifications.routes.js';
import { registerEventHandlers } from './notifications.events.js';

export async function notificationsModule(app: FastifyInstance) {
  registerRoutes(app);
  registerEventHandlers(app.eventBus);
}
