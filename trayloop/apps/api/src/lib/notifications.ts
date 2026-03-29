import { db } from '@trayloop/database';
import { notifications, users } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { logger } from '@trayloop/utils';
import { sendEmail, isEmailEnabled } from './email.js';

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

  // Send email for email-type notifications
  if (payload.type === 'email' && isEmailEnabled()) {
    try {
      const [user] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (user?.email) {
        const textBody = payload.body;
        const htmlBody = payload.body
          .split('\n')
          .map((line) => line.trim() === '' ? '<br>' : `<p style="margin:0 0 4px">${line}</p>`)
          .join('\n');

        const actionUrl = payload.actionUrl;

        await sendEmail({
          to: user.email,
          subject: payload.subject,
          text: textBody,
          html: `<div style="font-family:Inter,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1C1917">
  <div style="background:#1C1917;padding:20px 24px;border-radius:8px 8px 0 0">
    <span style="color:#FFFFFF;font-size:16px;font-weight:700">TrayLoop</span>
  </div>
  <div style="padding:32px 24px;background:#FFFFFF;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px">
    ${htmlBody}
    ${actionUrl ? `<a href="${actionUrl}" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#1C1917;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">View your order</a>` : ''}
  </div>
  <p style="text-align:center;font-size:12px;color:#9CA3AF;margin-top:16px">Powered by TrayLoop</p>
</div>`,
        });
      }
    } catch (err) {
      logger.error('Email send failed (notification still saved)', { error: (err as Error).message, subject: payload.subject });
    }
  }

  logger.info('Notification processed', {
    userId: payload.userId,
    type: payload.type,
    subject: payload.subject,
    emailSent: payload.type === 'email' && isEmailEnabled(),
  });
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
      subject: `Your payment is confirmed — ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `Your deposit of ${amountStr} for order ${ctx.orderNumber} with ${ctx.merchantName} has been received.`,
        '',
        `Order: ${ctx.orderNumber}`,
        `Amount: ${amountStr}`,
        `Event date: ${dateStr}`,
        `Status: Confirmed`,
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

// --- Refund notification ---

export interface DepositRefundedContext {
  orderId: string;
  orderNumber: string;
  merchantName: string;
  depositAmount: number;
  currency: string;
  customerUserId: string | null;
  customerEmail: string;
  customerName: string;
  merchantOwnerUserId: string;
}

export async function notifyDepositRefunded(ctx: DepositRefundedContext): Promise<void> {
  const amountStr = `$${(ctx.depositAmount / 100).toFixed(2)}`;

  // Customer notification
  if (ctx.customerUserId) {
    await sendNotification({
      userId: ctx.customerUserId,
      type: 'email',
      subject: `Your refund has been processed — ${ctx.orderNumber}`,
      body: [
        `Hi ${ctx.customerName},`,
        '',
        `Your deposit of ${amountStr} for order ${ctx.orderNumber} with ${ctx.merchantName} has been refunded.`,
        '',
        `Refund amount: ${amountStr}`,
        `Order: ${ctx.orderNumber}`,
        '',
        `The refund will appear in your account within 5-10 business days.`,
        '',
        `If you have questions, please contact ${ctx.merchantName} directly.`,
      ].join('\n'),
      actionUrl: `/orders/${ctx.orderId}`,
    });
  }

  // Merchant notification
  await sendNotification({
    userId: ctx.merchantOwnerUserId,
    type: 'in_app',
    subject: `Deposit refunded — ${ctx.orderNumber}`,
    body: `Deposit of ${amountStr} for ${ctx.customerName} (${ctx.customerEmail}) on order ${ctx.orderNumber} has been refunded.`,
    actionUrl: `/orders/${ctx.orderId}`,
  });
}
