export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
}

export type EventMap = {
  'user.registered': { userId: string; email: string };
  'organization.created': { orgId: string; ownerId: string };
  'membership.invited': { orgId: string; email: string; role: string };
  'customer.created': { customerId: string; orgId: string };
  'order.created': { orderId: string; customerId: string; orgId: string };
  'order.status_updated': { orderId: string; oldStatus: string; newStatus: string; reason?: string };
  'recurring_order.created': { recurringOrderId: string; customerId: string; orgId: string };
  'recurring_order.cancelled': { recurringOrderId: string; customerId: string };
  'payment.completed': { paymentId: string; orderId: string; amount: number };
  'payment.failed': { paymentId: string; orderId: string; reason: string };
  'invoice.sent': { invoiceId: string; customerId: string; orgId: string };
  'follow_up.scheduled': { followUpId: string; customerId: string; orderId: string };
  'notification.requested': { userId: string; type: string; subject: string; body: string };
};

export type EventName = keyof EventMap;
