export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
}

export type EventMap = {
  'user.registered': { userId: string; email: string };
  'order.created': { orderId: string; customerId: string; merchantId: string };
  'order.status_updated': { orderId: string; oldStatus: string; newStatus: string };
  'payment.completed': { paymentId: string; orderId: string; amount: number };
  'payment.failed': { paymentId: string; orderId: string; reason: string };
  'notification.requested': { userId: string; type: string; subject: string; body: string };
};

export type EventName = keyof EventMap;
