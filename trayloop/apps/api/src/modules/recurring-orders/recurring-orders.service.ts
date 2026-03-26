import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateRecurringOrderInput, UpdateRecurringOrderInput } from './recurring-orders.schema.js';

export async function listByOrg(orgId: string) {
  throw new Error('Not implemented');
}

export async function listByCustomer(customerId: string) {
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  throw new Error('Not implemented');
}

export async function create(input: CreateRecurringOrderInput, eventBus: EventBus) {
  // TODO: Create recurring order, schedule first occurrence
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdateRecurringOrderInput) {
  throw new Error('Not implemented');
}

export async function cancel(id: string, eventBus: EventBus) {
  // TODO: Cancel recurring order, emit event
  throw new Error('Not implemented');
}
