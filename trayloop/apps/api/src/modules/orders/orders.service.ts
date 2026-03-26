import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from './orders.schema.js';

export async function listByOrg(orgId: string) {
  // TODO: Query orders by organization_id
  throw new Error('Not implemented');
}

export async function listByCustomer(customerId: string) {
  // TODO: Query orders by customer_id
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  // TODO: Fetch order by ID
  throw new Error('Not implemented');
}

export async function create(orgId: string, input: CreateOrderInput, eventBus: EventBus) {
  // TODO: Create order with organizationId = orgId, calculate totals
  // await eventBus.emit('order.created', { orderId, customerId: input.customerId, orgId });
  throw new Error('Not implemented');
}

export async function updateStatus(id: string, input: UpdateOrderStatusInput, eventBus: EventBus) {
  // TODO: Update status, emit event
  // await eventBus.emit('order.status_updated', { orderId: id, oldStatus, newStatus: input.status });
  throw new Error('Not implemented');
}
