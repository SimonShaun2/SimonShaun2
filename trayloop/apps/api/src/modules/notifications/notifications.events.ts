import type { EventBus } from '../../lib/event-bus/index.js';
import { logger } from '@trayloop/utils';

export function registerEventHandlers(eventBus: EventBus) {
  eventBus.on('user.registered', async (event) => {
    logger.info('Notification: queueing welcome message', { userId: event.payload.userId });
    // TODO: Queue welcome notification
  });

  eventBus.on('order.created', async (event) => {
    logger.info('Notification: queueing order confirmation', { orderId: event.payload.orderId });
    // TODO: Queue order confirmation for customer and merchant
  });

  eventBus.on('payment.completed', async (event) => {
    logger.info('Notification: queueing payment receipt', { orderId: event.payload.orderId });
    // TODO: Queue payment receipt
  });

  eventBus.on('recurring_order.cancelled', async (event) => {
    logger.info('Notification: queueing cancellation confirmation', { recurringOrderId: event.payload.recurringOrderId });
    // TODO: Queue cancellation confirmation
  });
}
