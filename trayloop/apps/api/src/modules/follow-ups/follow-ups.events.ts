import type { EventBus } from '../../lib/event-bus/index.js';
import { logger } from '@trayloop/utils';

export function registerEventHandlers(eventBus: EventBus) {
  eventBus.on('order.status_updated', async (event) => {
    if (event.payload.newStatus === 'completed') {
      logger.info('Follow-up: scheduling post-service follow-up', { orderId: event.payload.orderId });
      // TODO: Schedule feedback request follow-up
    }
  });
}
