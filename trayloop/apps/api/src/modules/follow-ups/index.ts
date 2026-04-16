import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './follow-ups.routes.js';
import { registerEventHandlers } from './follow-ups.events.js';

export async function followUpsModule(app: FastifyInstance) {
  registerRoutes(app);
  registerEventHandlers(app.eventBus);
}
