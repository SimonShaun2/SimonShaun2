import type { EventBus } from '../../lib/event-bus/index.js';
import { logger } from '@trayloop/utils';

export function registerEventHandlers(eventBus: EventBus) {
  eventBus.on('payment.completed', async (event) => {
    logger.info('Order: payment completed, updating order status', { orderId: event.payload.orderId });
    // TODO: Update order status to 'confirmed'
  });
}
