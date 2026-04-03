import { db } from '@trayloop/database';
import { customers, locations, orderItems, orders, organizations } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { logger } from '@trayloop/utils';
import type { EventBus } from '../../lib/event-bus/index.js';
import {
  getMerchantDashboardUrl,
  getStorefrontAccountUrl,
  notifyCustomerEmail,
  notifyCustomerSms,
  sendNotification,
} from '../../lib/notifications.js';

interface OrderNotificationContext {
  id: string;
  orderNumber: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  currency: string;
  scheduledAt: Date | null;
  notes: string | null;
  customerUserId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  customerCompany: string | null;
  merchantName: string;
  merchantOwnerUserId: string;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
  locationState: string | null;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
}

const SERVICE_MODE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  full_service: 'Full Service',
  on_site: 'On-Site',
  food_truck: 'Food Truck',
};

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatEventDate(date: Date | null) {
  if (!date) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatServiceType(serviceType: string) {
  return SERVICE_MODE_LABELS[serviceType] ?? serviceType;
}

function buildOrderSummaryLines(ctx: OrderNotificationContext) {
  const lines = [
    `Order: ${ctx.orderNumber}`,
    `Service: ${formatServiceType(ctx.serviceType)}`,
    `Event date: ${formatEventDate(ctx.scheduledAt)}`,
    `Total: ${formatCurrency(ctx.totalAmount, ctx.currency)}`,
  ];

  if (ctx.locationName) {
    lines.push(`Location: ${ctx.locationName}`);
  }

  if (ctx.locationAddress) {
    const locality = [ctx.locationCity, ctx.locationState].filter(Boolean).join(', ');
    lines.push(`Address: ${ctx.locationAddress}${locality ? `, ${locality}` : ''}`);
  }

  if (ctx.customerPhone) {
    lines.push(`Contact phone: ${ctx.customerPhone}`);
  }

  if (ctx.customerCompany) {
    lines.push(`Company: ${ctx.customerCompany}`);
  }

  if (ctx.items.length > 0) {
    lines.push('', 'Items:');
    for (const item of ctx.items) {
      lines.push(`- ${item.quantity} x ${item.name} (${formatCurrency(item.totalPrice, ctx.currency)})`);
    }
  }

  if (ctx.notes) {
    lines.push('', `Notes: ${ctx.notes}`);
  }

  return lines;
}

function buildStatusUpdateCopy(
  ctx: OrderNotificationContext,
  newStatus: string,
  reason?: string,
): { subject: string; body: string } | null {
  if (newStatus === 'confirmed') {
    return {
      subject: `Your order is confirmed - ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `${ctx.merchantName} confirmed your order.`,
        '',
        ...buildOrderSummaryLines(ctx),
        '',
        'Next step: keep an eye on your inbox for any final adjustments before service day.',
      ].join('\n'),
    };
  }

  if (newStatus === 'completed') {
    return {
      subject: `Your order is complete - ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `${ctx.merchantName} marked your order as complete.`,
        '',
        ...buildOrderSummaryLines(ctx),
        '',
        `Next step: if you need another event, you can reorder from your account or contact ${ctx.merchantName} directly.`,
      ].join('\n'),
    };
  }

  if (newStatus === 'cancelled') {
    return {
      subject: `Your order was cancelled - ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `${ctx.merchantName} cancelled your order.`,
        ...(reason ? ['', `Reason: ${reason}`] : []),
        '',
        ...buildOrderSummaryLines(ctx),
        '',
        'Next step: reply to the merchant if you want to reschedule or discuss a replacement order.',
      ].join('\n'),
    };
  }

  return null;
}

async function loadOrderNotificationContext(orderId: string): Promise<OrderNotificationContext | null> {
  const [row] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      serviceType: orders.serviceType,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      scheduledAt: orders.scheduledAt,
      notes: orders.notes,
      customerUserId: customers.userId,
      customerEmail: customers.email,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerPhone: customers.phone,
      customerCompany: customers.companyName,
      merchantName: organizations.name,
      merchantOwnerUserId: organizations.ownerId,
      locationName: locations.name,
      locationAddress: locations.address,
      locationCity: locations.city,
      locationState: locations.state,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .leftJoin(locations, eq(locations.id, orders.locationId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!row) {
    return null;
  }

  const items = await db
    .select({
      name: orderItems.name,
      quantity: orderItems.quantity,
      totalPrice: orderItems.totalPrice,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    serviceType: row.serviceType,
    totalAmount: row.totalAmount,
    currency: row.currency,
    scheduledAt: row.scheduledAt,
    notes: row.notes,
    customerUserId: row.customerUserId,
    customerEmail: row.customerEmail,
    customerName: `${row.customerFirstName} ${row.customerLastName}`.trim(),
    customerPhone: row.customerPhone,
    customerCompany: row.customerCompany,
    merchantName: row.merchantName,
    merchantOwnerUserId: row.merchantOwnerUserId,
    locationName: row.locationName,
    locationAddress: row.locationAddress,
    locationCity: row.locationCity,
    locationState: row.locationState,
    items,
  };
}

export function registerEventHandlers(eventBus: EventBus) {
  eventBus.on('user.registered', async (event) => {
    logger.info('Notification: queueing welcome message', { userId: event.payload.userId });
  });

  eventBus.on('order.created', async (event) => {
    const ctx = await loadOrderNotificationContext(event.payload.orderId);
    if (!ctx) {
      logger.warn('Notification: order context missing for order.created', { orderId: event.payload.orderId });
      return;
    }

    const customerBody = [
      `Hi ${ctx.customerName},`,
      '',
      `Thanks for ordering with ${ctx.merchantName}. We received your order and the team will review it shortly.`,
      '',
      ...buildOrderSummaryLines(ctx),
      '',
      'We will send another update as soon as the merchant confirms the order.',
    ].join('\n');

    await notifyCustomerEmail({
      customerUserId: ctx.customerUserId,
      customerEmail: ctx.customerEmail,
      subject: `We received your order - ${ctx.orderNumber}`,
      body: customerBody,
      actionUrl: getStorefrontAccountUrl(),
      merchantName: ctx.merchantName,
    });

    await notifyCustomerSms({
      customerUserId: ctx.customerUserId,
      customerPhone: ctx.customerPhone,
      subject: `Order received - ${ctx.orderNumber}`,
      body: `${ctx.merchantName} received your order for ${formatEventDate(ctx.scheduledAt)}. Total: ${formatCurrency(ctx.totalAmount, ctx.currency)}.`,
      actionUrl: getStorefrontAccountUrl(),
    });

    const merchantBody = [
      `New order ${ctx.orderNumber} from ${ctx.customerName}.`,
      '',
      `Customer email: ${ctx.customerEmail}`,
      ...(ctx.customerPhone ? [`Customer phone: ${ctx.customerPhone}`] : []),
      `Total: ${formatCurrency(ctx.totalAmount, ctx.currency)}`,
      `Service: ${formatServiceType(ctx.serviceType)}`,
      `Event date: ${formatEventDate(ctx.scheduledAt)}`,
    ].join('\n');

    await sendNotification({
      userId: ctx.merchantOwnerUserId,
      type: 'in_app',
      subject: `New order received - ${ctx.orderNumber}`,
      body: merchantBody,
      actionUrl: `/orders/${ctx.id}`,
    });

    await sendNotification({
      userId: ctx.merchantOwnerUserId,
      type: 'email',
      subject: `New order received - ${ctx.orderNumber}`,
      body: merchantBody,
      actionUrl: getMerchantDashboardUrl(`/orders/${ctx.id}`),
    });
  });

  eventBus.on('order.status_updated', async (event) => {
    if (event.payload.newStatus === 'awaiting_deposit') {
      return;
    }

    const ctx = await loadOrderNotificationContext(event.payload.orderId);
    if (!ctx) {
      logger.warn('Notification: order context missing for order.status_updated', {
        orderId: event.payload.orderId,
        newStatus: event.payload.newStatus,
      });
      return;
    }

    const statusCopy = buildStatusUpdateCopy(ctx, event.payload.newStatus, event.payload.reason);
    if (!statusCopy) {
      return;
    }

    await notifyCustomerEmail({
      customerUserId: ctx.customerUserId,
      customerEmail: ctx.customerEmail,
      subject: statusCopy.subject,
      body: statusCopy.body,
      actionUrl: getStorefrontAccountUrl(),
      merchantName: ctx.merchantName,
    });

    let smsBody: string;
    if (event.payload.newStatus === 'confirmed') {
      smsBody = `${ctx.merchantName} confirmed ${ctx.orderNumber} for ${formatEventDate(ctx.scheduledAt)}.`;
    } else if (event.payload.newStatus === 'completed') {
      smsBody = `${ctx.merchantName} marked ${ctx.orderNumber} as complete. Thanks for your order!`;
    } else {
      smsBody = `${ctx.merchantName} cancelled ${ctx.orderNumber}.${event.payload.reason ? ` Reason: ${event.payload.reason}` : ''}`;
    }

    await notifyCustomerSms({
      customerUserId: ctx.customerUserId,
      customerPhone: ctx.customerPhone,
      subject: statusCopy.subject,
      body: smsBody,
      actionUrl: getStorefrontAccountUrl(),
    });
  });

  eventBus.on('payment.completed', async (event) => {
    logger.info('Notification: payment.completed observed', {
      orderId: event.payload.orderId,
      paymentId: event.payload.paymentId,
    });
  });

  eventBus.on('recurring_order.cancelled', async (event) => {
    logger.info('Notification: queueing cancellation confirmation', {
      recurringOrderId: event.payload.recurringOrderId,
    });
  });
}
