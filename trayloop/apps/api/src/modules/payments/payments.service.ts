import type { FastifyRequest } from 'fastify';
import type { EventBus } from '../../lib/event-bus/index.js';

export async function createCheckout(orderId: string, eventBus: EventBus) {
  // TODO: Create Stripe payment intent for order
  throw new Error('Not implemented');
}

export async function handleStripeWebhook(request: FastifyRequest, eventBus: EventBus) {
  // TODO: Verify webhook signature, process payment events
  // await eventBus.emit('payment.completed', { ... });
  throw new Error('Not implemented');
}

export async function listByOrder(orderId: string) {
  throw new Error('Not implemented');
}
