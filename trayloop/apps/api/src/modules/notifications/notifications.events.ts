import { db } from '@trayloop/database';
import { customers, locations, locationSettings, orderItems, orders, organizations } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { logger } from '@trayloop/utils';
import type { EventBus } from '../../lib/event-bus/index.js';
import { createOrderActionToken } from '../../lib/order-action-tokens.js';
import {
  getPublicApiUrl,
  getMerchantDashboardUrl,
  getStorefrontAccountUrl,
  notifyCustomerEmail,
  notifyCustomerSms,
  sendNotification,
} from '../../lib/notifications.js';
import { renderCustomerOrderEmail, renderMerchantOrderTicketEmail } from '../../lib/order-ticket-email.js';

interface OrderNotificationContext {
  id: string;
  organizationId: string;
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
  depositRequired: boolean;
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
): { subject: string; body: string; html: string } | null {
  if (newStatus === 'confirmed') {
    const email = renderCustomerOrderEmail(ctx, 'confirmed', {
      action: { label: 'View order', url: getStorefrontAccountUrl() },
    });
    return { subject: email.subject, body: email.text, html: email.html };
  }

  if (newStatus === 'completed') {
    const email = renderCustomerOrderEmail(ctx, 'completed', {
      action: { label: 'Reorder', url: getStorefrontAccountUrl() },
    });
    return { subject: email.subject, body: email.text, html: email.html };
  }

  if (newStatus === 'cancelled') {
    const email = renderCustomerOrderEmail(ctx, 'cancelled', { reason });
    return { subject: email.subject, body: email.text, html: email.html };
  }

  return null;
}

async function loadOrderNotificationContext(orderId: string): Promise<OrderNotificationContext | null> {
  const [row] = await db
    .select({
      id: orders.id,
      organizationId: orders.organizationId,
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
      depositRequired: locationSettings.depositRequired,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .leftJoin(locations, eq(locations.id, orders.locationId))
    .leftJoin(locationSettings, eq(locationSettings.locationId, orders.locationId))
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
    organizationId: row.organizationId,
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
    depositRequired: row.depositRequired ?? true,
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

    const customerEmail = renderCustomerOrderEmail(ctx, 'received', {
      action: { label: 'View order', url: getStorefrontAccountUrl() },
    });

    await notifyCustomerEmail({
      customerUserId: ctx.customerUserId,
      customerEmail: ctx.customerEmail,
      subject: customerEmail.subject,
      body: customerEmail.text,
      actionUrl: getStorefrontAccountUrl(),
      actionLabel: 'View order',
      merchantName: ctx.merchantName,
      html: customerEmail.html,
    });

    await notifyCustomerSms({
      customerUserId: ctx.customerUserId,
      customerPhone: ctx.customerPhone,
      subject: `Order received - ${ctx.orderNumber}`,
      body: `${ctx.merchantName} received your order for ${formatEventDate(ctx.scheduledAt)}. Total: ${formatCurrency(ctx.totalAmount, ctx.currency)}.`,
      actionUrl: getStorefrontAccountUrl(),
    });

    const merchantDashboardUrl = getMerchantDashboardUrl(`/orders/${ctx.id}`);
    const merchantAcceptUrl = !ctx.depositRequired
      ? `${getPublicApiUrl('/api/order-email-actions/accept')}?token=${encodeURIComponent(
          await createOrderActionToken({
            action: 'accept_order',
            orderId: ctx.id,
            organizationId: ctx.organizationId,
          }),
        )}`
      : undefined;
    const merchantEmail = renderMerchantOrderTicketEmail(ctx, {
      dashboardUrl: merchantDashboardUrl,
      acceptUrl: merchantAcceptUrl,
      depositRequired: ctx.depositRequired,
    });

    await sendNotification({
      userId: ctx.merchantOwnerUserId,
      type: 'in_app',
      subject: `New order received - ${ctx.orderNumber}`,
      body: merchantEmail.text,
      actionUrl: `/orders/${ctx.id}`,
    });

    await sendNotification({
      userId: ctx.merchantOwnerUserId,
      type: 'email',
      subject: merchantEmail.subject,
      body: merchantEmail.text,
      actionUrl: merchantDashboardUrl,
      actionLabel: 'Open in dashboard',
      html: merchantEmail.html,
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
      actionLabel: event.payload.newStatus === 'completed' ? 'Reorder' : 'View order',
      merchantName: ctx.merchantName,
      html: statusCopy.html,
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
