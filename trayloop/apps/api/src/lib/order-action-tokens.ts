import { createToken, verifyToken } from '@trayloop/auth';
import { UnauthorizedError } from './errors.js';

type OrderEmailAction = 'accept_order';

interface OrderActionTokenPayload {
  sub: string;
  email: string;
  role: string;
  orderActionType: 'merchant_order_email_action';
  action: OrderEmailAction;
  orderId: string;
  organizationId: string;
}

export async function createOrderActionToken(input: {
  action: OrderEmailAction;
  orderId: string;
  organizationId: string;
  expiresIn?: string;
}) {
  return createToken({
    sub: `order-action:${input.orderId}`,
    email: 'merchant-order-actions@trayloop.local',
    role: 'order_email_action',
    orderActionType: 'merchant_order_email_action',
    action: input.action,
    orderId: input.orderId,
    organizationId: input.organizationId,
  } as unknown as never, input.expiresIn ?? '5d');
}

export async function verifyOrderActionToken(token: string, expectedAction: OrderEmailAction) {
  let payload: OrderActionTokenPayload;
  try {
    payload = await verifyToken(token) as unknown as OrderActionTokenPayload;
  } catch {
    throw new UnauthorizedError('This email action link is invalid or expired.');
  }

  if (
    payload.orderActionType !== 'merchant_order_email_action'
    || payload.action !== expectedAction
    || !payload.orderId
    || !payload.organizationId
  ) {
    throw new UnauthorizedError('This email action link is invalid or expired.');
  }

  return payload;
}
