import type { FastifyInstance } from 'fastify';
import { registerEventHandlers } from './notifications.events.js';

export async function notificationsModule(app: FastifyInstance) {
  registerEventHandlers((app as any).eventBus);
}
