import { EventEmitter } from 'events';
import type { EventMap, EventName, DomainEvent } from '@trayloop/types';
import { generateId } from '@trayloop/utils';
import { logger } from '@trayloop/utils';

type EventHandler<T extends EventName> = (event: DomainEvent<EventMap[T]>) => void | Promise<void>;

export class EventBus {
  private emitter = new EventEmitter();
  private handlers: Array<{ event: EventName; handler: EventHandler<any> }> = [];

  on<T extends EventName>(event: T, handler: EventHandler<T>): void {
    this.handlers.push({ event, handler });
  }

  async emit<T extends EventName>(event: T, payload: EventMap[T]): Promise<void> {
    const domainEvent: DomainEvent<EventMap[T]> = {
      id: generateId(),
      type: event,
      payload,
      timestamp: new Date(),
    };
    logger.info(`Event emitted: ${event}`, { eventId: domainEvent.id });
    this.emitter.emit(event, domainEvent);
  }

  initialize(): void {
    for (const { event, handler } of this.handlers) {
      this.emitter.on(event, handler);
    }
    logger.info(`Event bus initialized with ${this.handlers.length} handlers`);
  }
}
