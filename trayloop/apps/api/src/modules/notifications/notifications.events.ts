import type { EventBus } from '../../lib/event-bus/index.js';
import { logger } from '@trayloop/utils';

export function registerEventHandlers(eventBus: EventBus) {
  eventBus.on('user.registered', async (event) => {
    logger.info('Notification: sending welcome email', { userId: event.payload.userId });
    // TODO: Queue welcome email via worker
  });

  eventBus.on('order.created', async (event) => {
    logger.info('Notification: sending order confirmation', { orderId: event.payload.orderId });
    // TODO: Queue order confirmation email
  });

  eventBus.on('payment.completed', async (event) => {
    logger.info('Notification: sending payment receipt', { orderId: event.payload.orderId });
    // TODO: Queue payment receipt email
  });
}
