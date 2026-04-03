import type { EventBus } from '../../lib/event-bus/index.js';
import { NotImplementedError } from '../../lib/errors.js';

export async function createCheckout(_orderId: string, _eventBus: EventBus) {
  throw new NotImplementedError('Legacy payments checkout is disabled. Use the current order deposit flow instead.');
}

export async function listByOrder(_orderId: string) {
  throw new NotImplementedError('Legacy payment listing is not available on this API surface.');
}
