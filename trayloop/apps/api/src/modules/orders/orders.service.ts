import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from './orders.schema.js';

export async function listByOrg(orgId: string) {
  throw new Error('Not implemented');
}

export async function listByCustomer(customerId: string) {
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  throw new Error('Not implemented');
}

export async function create(input: CreateOrderInput, eventBus: EventBus) {
  // TODO: Create order, calculate totals from catalog items
  // await eventBus.emit('order.created', { ... });
  throw new Error('Not implemented');
}

export async function updateStatus(id: string, input: UpdateOrderStatusInput, eventBus: EventBus) {
  // TODO: Update status, emit event
  // await eventBus.emit('order.status_updated', { ... });
  throw new Error('Not implemented');
}
