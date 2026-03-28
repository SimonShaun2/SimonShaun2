import { db } from '@trayloop/database';
import { notifications } from '@trayloop/database';
import { logger } from '@trayloop/utils';

export interface NotificationPayload {
  userId: string;
  type: 'email' | 'in_app';
  subject: string;
  body: string;
  actionUrl?: string;
}

/**
 * Send a notification. Currently logs and persists to the notifications table.
 * When email infrastructure is added, this function will dispatch to the
 * email provider as well.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  // Persist to notifications table
  try {
    await db.insert(notifications).values({
      userId: payload.userId,
      type: payload.type,
      status: 'sent',
      subject: payload.subject,
      body: payload.body,
      actionUrl: payload.actionUrl,
      sentAt: new Date(),
    });
  } catch (err) {
    logger.error('Failed to persist notification', { error: (err as Error).message, subject: payload.subject });
  }

  // Log the notification (acts as email stub until real email is wired)
  logger.info('Notification sent', {
    userId: payload.userId,
    type: payload.type,
    subject: payload.subject,
  });

  // TODO: When email provider is configured, send email here:
  // if (payload.type === 'email') {
  //   await emailProvider.send({ to: userEmail, subject, html: body });
  // }
}

// --- Convenience helpers for common notifications ---

export interface DepositPaidContext {
  orderId: string;
  orderNumber: string;
  merchantName: string;
  depositAmount: number;
  currency: string;
  eventDate: Date | null;
  customerUserId: string | null;
  customerEmail: string;
  customerName: string;
  merchantOwnerUserId: string;
}

export async function notifyDepositPaid(ctx: DepositPaidContext): Promise<void> {
  const amountStr = `$${(ctx.depositAmount / 100).toFixed(2)}`;
  const dateStr = ctx.eventDate ? ctx.eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';

  // Customer notification
  if (ctx.customerUserId) {
    await sendNotification({
      userId: ctx.customerUserId,
      type: 'email',
      subject: `Payment confirmed — ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `Your deposit of ${amountStr} for order ${ctx.orderNumber} with ${ctx.merchantName} has been received.`,
        '',
        `Order details:`,
        `  Order: ${ctx.orderNumber}`,
        `  Amount: ${amountStr}`,
        `  Event date: ${dateStr}`,
        `  Status: Confirmed`,
        '',
        `You will receive updates as your order progresses.`,
      ].join('\n'),
      actionUrl: `/orders/${ctx.orderId}`,
    });
  }

  // Merchant notification
  await sendNotification({
    userId: ctx.merchantOwnerUserId,
    type: 'in_app',
    subject: `Deposit received — ${ctx.orderNumber}`,
    body: [
      `${ctx.customerName} (${ctx.customerEmail}) paid a deposit of ${amountStr} for order ${ctx.orderNumber}.`,
      '',
      `Event date: ${dateStr}`,
      `The order has been confirmed.`,
    ].join('\n'),
    actionUrl: `/orders/${ctx.orderId}`,
  });
}
