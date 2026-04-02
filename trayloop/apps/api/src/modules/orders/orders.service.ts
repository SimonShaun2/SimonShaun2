import { db } from '@trayloop/database';
import {
  orders,
  orderItems,
  recurringOrders,
  customers,
  customerAddresses,
  locations,
  locationSettings,
  deposits,
  organizations,
} from '@trayloop/database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { calculatePricing } from '../../lib/pricing.js';
import { recordOrderEvent, getOrderTimeline } from '../../lib/order-events.js';
import { getStripe, isStripeEnabled } from '../../lib/stripe.js';
import { logger } from '@trayloop/utils';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput, OrderListQuery, SendDepositLinkInput, ReorderInput } from './orders.schema.js';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Transaction;

interface DepositCheckoutOptions {
  depositAmount?: number;
  successUrl: string;
  cancelUrl: string;
}

interface DepositCheckoutResult {
  orderId: string;
  status: string;
  depositId: string;
  depositAmount: number;
  currency: string;
  paymentLink: string;
  stripeCheckoutSessionId: string | null;
  sentTo: string;
  depositRequired: true;
  allowedTransitions: string[];
}

interface DepositCheckoutContext {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerId: string;
  locationId: string | null;
}

export async function createDepositCheckoutForOrder(
  order: DepositCheckoutContext,
  orgId: string,
  eventBus: EventBus,
  options: DepositCheckoutOptions,
): Promise<DepositCheckoutResult> {
  const depositRequired = await getDepositRequired(order.locationId);
  if (!depositRequired) {
    throw new ValidationError('This location does not require deposits. Confirm the order directly.');
  }

  const allowed = getAllowedTransitions(order.status, depositRequired);
  if (!allowed.includes('awaiting_deposit') && order.status !== 'awaiting_deposit') {
    throw new ValidationError(
      `Cannot send deposit link for order in "${order.status}" status. ` +
      `Allowed transitions: ${allowed.join(', ')}`,
    );
  }

  const [[customer], [org]] = await Promise.all([
    db.select({ email: customers.email, firstName: customers.firstName })
      .from(customers).where(eq(customers.id, order.customerId)).limit(1),
    db.select({
      stripeAccountId: organizations.stripeAccountId,
      stripeOnboardingComplete: organizations.stripeOnboardingComplete,
      name: organizations.name,
    })
      .from(organizations).where(eq(organizations.id, orgId)).limit(1),
  ]);

  if (!customer || !org) {
    throw new NotFoundError('Order payment context');
  }

  const depositAmount = options.depositAmount ?? order.totalAmount;

  let paymentLink: string;
  let checkoutSessionId: string | null = null;

  if (isStripeEnabled() && org.stripeAccountId && org.stripeOnboardingComplete) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: depositAmount,
          product_data: {
            name: `Deposit for ${order.orderNumber}`,
            description: `Order deposit - ${org.name}`,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: Math.round(depositAmount * 0.05),
        transfer_data: {
          destination: org.stripeAccountId,
        },
      },
      customer_email: customer.email,
      metadata: {
        trayloop_order_id: order.id,
        trayloop_order_number: order.orderNumber,
        trayloop_org_id: orgId,
        trayloop_deposit: 'true',
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
    });

    paymentLink = session.url!;
    checkoutSessionId = session.id;
  } else {
    paymentLink = `https://pay.trayloop.com/deposit/${crypto.randomUUID()}`;
  }

  const result = await db.transaction(async (tx) => {
    await tx
      .update(deposits)
      .set({ status: 'refunded', updatedAt: new Date() })
      .where(and(eq(deposits.orderId, order.id), eq(deposits.status, 'pending')));

    const [deposit] = await tx.insert(deposits).values({
      orderId: order.id,
      amount: depositAmount,
      currency: 'USD',
      status: 'pending',
      stripeCheckoutSessionId: checkoutSessionId,
    }).returning();

    const [updated] = await tx.update(orders).set({
      status: 'awaiting_deposit',
      updatedAt: new Date(),
    }).where(eq(orders.id, order.id)).returning();

    return { deposit, order: updated };
  });

  try {
    await recordOrderEvent(
      order.id,
      'deposit_link_sent',
      `Deposit link sent to ${customer.email} for $${(depositAmount / 100).toFixed(2)}`,
    );
  } catch {}
  try {
    await eventBus.emit('order.status_updated', {
      orderId: order.id,
      oldStatus: order.status,
      newStatus: 'awaiting_deposit',
    });
  } catch {}

  return {
    orderId: result.order.id,
    status: result.order.status,
    depositId: result.deposit.id,
    depositAmount: result.deposit.amount,
    currency: result.deposit.currency,
    paymentLink,
    stripeCheckoutSessionId: checkoutSessionId,
    sentTo: customer.email,
    depositRequired: true,
    allowedTransitions: getAllowedTransitions('awaiting_deposit', true),
  };
}

export async function getOrderStats(orgId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(total_amount), 0)::int`,
      last7DaysRevenue: sql<number>`coalesce(sum(case when created_at >= ${sevenDaysAgo} then total_amount else 0 end), 0)::int`,
      last30DaysRevenue: sql<number>`coalesce(sum(case when created_at >= ${thirtyDaysAgo} then total_amount else 0 end), 0)::int`,
      completedOrders: sql<number>`count(case when status = 'completed' then 1 end)::int`,
      activeOrders: sql<number>`count(case when status in ('submitted', 'awaiting_deposit', 'confirmed') then 1 end)::int`,
    })
    .from(orders)
    .where(eq(orders.organizationId, orgId));

  const [customerStats] = await db
    .select({
      totalCustomers: sql<number>`count(distinct customer_id)::int`,
      repeatCustomers: sql<number>`count(distinct case when ct > 1 then customer_id end)::int`,
    })
    .from(
      db.select({
        customerId: orders.customerId,
        ct: sql<number>`count(*)`.as('ct'),
      })
      .from(orders)
      .where(eq(orders.organizationId, orgId))
      .groupBy(orders.customerId)
      .as('sub')
    );

  const avgOrderValue = totals.totalOrders > 0 ? Math.round(totals.totalRevenue / totals.totalOrders) : 0;

  // Daily revenue for last 7 days
  const dailyRevenue = await db
    .select({
      date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`.as('date'),
      revenue: sql<number>`coalesce(sum(total_amount), 0)::int`,
      orderCount: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(eq(orders.organizationId, orgId), gte(orders.createdAt, sevenDaysAgo)))
    .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM-DD')`);

  // Per-location breakdown
  const locationBreakdown = await db
    .select({
      locationId: orders.locationId,
      locationName: locations.name,
      orderCount: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(orders.total_amount), 0)::int`,
    })
    .from(orders)
    .leftJoin(locations, eq(locations.id, orders.locationId))
    .where(eq(orders.organizationId, orgId))
    .groupBy(orders.locationId, locations.name);

  // 7-day order count
  const [last7DaysOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.organizationId, orgId), gte(orders.createdAt, sevenDaysAgo)));

  return {
    totalOrders: totals.totalOrders,
    totalRevenue: totals.totalRevenue,
    last7DaysRevenue: totals.last7DaysRevenue,
    last30DaysRevenue: totals.last30DaysRevenue,
    last7DaysOrders: last7DaysOrders.count,
    completedOrders: totals.completedOrders,
    activeOrders: totals.activeOrders,
    avgOrderValue,
    totalCustomers: customerStats.totalCustomers,
    repeatCustomers: customerStats.repeatCustomers,
    dailyRevenue,
    locationBreakdown,
  };
}

// --- Status transition rules ---
// Deposit required:  submitted → awaiting_deposit → confirmed → completed
// No deposit:        submitted → confirmed → completed
// Cancellation allowed from any non-terminal state

const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

const SERVICE_MODE_LABELS: Record<string, string> = {
  delivery: 'delivery',
  pickup: 'pickup',
  full_service: 'full service',
  on_site: 'on-site',
  food_truck: 'food truck',
};

function getAllowedTransitions(currentStatus: string, depositRequired: boolean): string[] {
  const allowed: string[] = [];

  if (currentStatus === 'submitted') {
    if (depositRequired) {
      allowed.push('awaiting_deposit');
    } else {
      allowed.push('confirmed');
    }
  } else if (currentStatus === 'awaiting_deposit') {
    allowed.push('confirmed');
  } else if (currentStatus === 'confirmed') {
    allowed.push('completed');
  }

  if (!TERMINAL_STATUSES.has(currentStatus)) {
    allowed.push('cancelled');
  }

  return allowed;
}

function getAvailableServiceModes(settings: typeof locationSettings.$inferSelect | undefined) {
  const next = new Set(settings?.serviceTypes ?? []);

  if (settings?.deliveryEnabled ?? true) {
    next.add('delivery');
  } else {
    next.delete('delivery');
  }

  if (settings?.pickupEnabled ?? false) {
    next.add('pickup');
  } else {
    next.delete('pickup');
  }

  return next.size > 0 ? Array.from(next) : ['delivery'];
}

async function getDepositRequired(locationId: string | null): Promise<boolean> {
  if (!locationId) return true;
  const [settings] = await db
    .select({ depositRequired: locationSettings.depositRequired })
    .from(locationSettings)
    .where(eq(locationSettings.locationId, locationId))
    .limit(1);
  return settings?.depositRequired ?? true;
}

// --- Order number generation ---

async function generateOrderNumber(orgId: string, txDb?: DbOrTx): Promise<string> {
  const database = txDb ?? db;

  // Lock the organization row to serialize order number generation
  // and prevent duplicate numbers from concurrent transactions.
  await database.execute(
    sql`SELECT id FROM organizations WHERE id = ${orgId} FOR UPDATE`
  );

  const [result] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.organizationId, orgId));

  const next = (result?.count ?? 0) + 1;
  return `TL-${next.toString().padStart(6, '0')}`;
}

// --- List orders (merchant dashboard) ---

export async function listByOrg(orgId: string, query: OrderListQuery) {
  const conditions = [eq(orders.organizationId, orgId)];

  if (query.status) {
    conditions.push(eq(orders.status, query.status));
  }
  if (query.from) {
    conditions.push(gte(orders.scheduledAt, new Date(query.from)));
  }
  if (query.to) {
    conditions.push(lte(orders.scheduledAt, new Date(query.to)));
  }

  const where = conditions.length === 1 ? conditions[0] : and(...conditions)!;
  const offset = (query.page - 1) * query.pageSize;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        serviceType: orders.serviceType,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        headCount: orders.headCount,
        scheduledAt: orders.scheduledAt,
        completedAt: orders.completedAt,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        locationName: locations.name,
        locationCity: locations.city,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        customerCompany: customers.companyName,
        itemCount: sql<number>`(
          select count(*)::int from order_items
          where order_items.order_id = orders.id
        )`,
        depositStatus: sql<string | null>`(
          select status from deposits
          where deposits.order_id = orders.id
          order by deposits.created_at desc limit 1
        )`,
        depositAmount: sql<number | null>`(
          select amount from deposits
          where deposits.order_id = orders.id
          order by deposits.created_at desc limit 1
        )`,
      })
      .from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId))
      .leftJoin(locations, eq(locations.id, orders.locationId))
      .where(where)
      .orderBy(desc(orders.scheduledAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    orders: rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      status: r.status,
      serviceType: r.serviceType,
      eventDate: r.scheduledAt,
      headCount: r.headCount,
      itemCount: r.itemCount,
      pricing: {
        total: r.totalAmount,
        currency: r.currency,
      },
      location: r.locationName
        ? { name: r.locationName, city: r.locationCity }
        : null,
      customer: {
        name: `${r.customerFirstName} ${r.customerLastName}`,
        email: r.customerEmail,
        phone: r.customerPhone,
        company: r.customerCompany,
      },
      deposit: r.depositStatus ? {
        status: r.depositStatus,
        amount: r.depositAmount,
      } : null,
      timestamps: {
        created: r.createdAt,
        updated: r.updatedAt,
        completed: r.completedAt,
      },
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function listByCustomer(customerId: string) {
  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      serviceType: orders.serviceType,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      headCount: orders.headCount,
      scheduledAt: orders.scheduledAt,
      createdAt: orders.createdAt,
      locationName: locations.name,
    })
    .from(orders)
    .leftJoin(locations, eq(locations.id, orders.locationId))
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.scheduledAt));

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    serviceType: r.serviceType,
    eventDate: r.scheduledAt,
    headCount: r.headCount,
    pricing: { total: r.totalAmount, currency: r.currency },
    location: r.locationName,
    createdAt: r.createdAt,
  }));
}

// --- Get order detail ---

export async function getById(id: string, orgId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  // Fetch all related data in parallel
  const [items, [customer], locationRow, [address], latestDeposit] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
        phone: customers.phone,
        companyName: customers.companyName,
      })
      .from(customers)
      .where(eq(customers.id, order.customerId))
      .limit(1),
    order.locationId
      ? db
          .select({
            name: locations.name,
            address: locations.address,
            city: locations.city,
            state: locations.state,
            zipCode: locations.zipCode,
            country: locations.country,
            phone: locations.phone,
            email: locations.email,
          })
          .from(locations)
          .where(eq(locations.id, order.locationId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
    db
      .select({
        address: customerAddresses.address,
        city: customerAddresses.city,
        state: customerAddresses.state,
        zipCode: customerAddresses.zipCode,
        country: customerAddresses.country,
      })
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, order.customerId))
      .limit(1),
    db
      .select({
        id: deposits.id,
        amount: deposits.amount,
        currency: deposits.currency,
        status: deposits.status,
        stripeCheckoutSessionId: deposits.stripeCheckoutSessionId,
        stripePaymentIntentId: deposits.stripePaymentIntentId,
        paidAt: deposits.paidAt,
        createdAt: deposits.createdAt,
      })
      .from(deposits)
      .where(eq(deposits.orderId, id))
      .orderBy(desc(deposits.createdAt))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  // Compute pricing breakdown from line items
  const packageItems = items.filter((i) => i.packageId !== null);
  const addOnItems = items.filter((i) => i.packageId === null);
  const packageSubtotal = packageItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const addOnSubtotal = addOnItems.reduce((sum, i) => sum + i.totalPrice, 0);

  // Determine allowed status transitions based on location deposit setting
  const [depositRequired, timeline] = await Promise.all([
    getDepositRequired(order.locationId),
    getOrderTimeline(id),
  ]);
  const allowedTransitions = getAllowedTransitions(order.status, depositRequired);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    serviceType: order.serviceType,
    depositRequired,
    allowedTransitions,
    eventDate: order.scheduledAt,
    headCount: order.headCount,
    notes: order.notes,
    pricing: {
      packageSubtotal,
      addOnSubtotal,
      total: order.totalAmount,
      currency: order.currency,
    },
    location: locationRow
      ? {
          name: locationRow.name,
          address: locationRow.address,
          city: locationRow.city,
          state: locationRow.state,
          zipCode: locationRow.zipCode,
          country: locationRow.country,
          phone: locationRow.phone,
          email: locationRow.email,
        }
      : null,
    customer: {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      company: customer.companyName,
    },
    deliveryAddress: address ?? null,
    deposit: latestDeposit ? {
      id: latestDeposit.id,
      amount: latestDeposit.amount,
      currency: latestDeposit.currency,
      status: latestDeposit.status,
      paidAt: latestDeposit.paidAt,
      hasStripeSession: !!latestDeposit.stripeCheckoutSessionId,
      stripePaymentIntentId: latestDeposit.stripePaymentIntentId,
    } : null,
    items: {
      packages: packageItems.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      addOns: addOnItems.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
    },
    timeline,
    timestamps: {
      created: order.createdAt,
      updated: order.updatedAt,
      completed: order.completedAt,
    },
  };
}

// --- Update order status ---

export async function updateStatus(id: string, orgId: string, input: UpdateOrderStatusInput, eventBus: EventBus) {
  const [existing] = await db
    .select({ status: orders.status, locationId: orders.locationId })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!existing) throw new NotFoundError('Order');

  // Terminal states cannot be changed
  if (TERMINAL_STATUSES.has(existing.status)) {
    throw new ValidationError(
      `Order is "${existing.status}" and cannot be updated`,
    );
  }

  // Look up deposit requirement from location settings
  const depositRequired = await getDepositRequired(existing.locationId);

  // Validate transition against deposit-aware rules
  const allowed = getAllowedTransitions(existing.status, depositRequired);
  if (!allowed.includes(input.status)) {
    throw new ValidationError(
      `Cannot transition from "${existing.status}" to "${input.status}". ` +
      `Allowed: ${allowed.join(', ')}`,
    );
  }

  // Set timestamps based on target status
  const now = new Date();
  const completedAt = input.status === 'completed' ? now : undefined;

  const [updated] = await db
    .update(orders)
    .set({
      status: input.status,
      completedAt,
      notes: input.status === 'cancelled' && input.reason
        ? sql`coalesce(${orders.notes}, '') || E'\n[Cancelled] ' || ${input.reason}`
        : undefined,
      updatedAt: now,
    })
    .where(eq(orders.id, id))
    .returning();

  const statusLabel = input.status.replace('_', ' ');
  const description = input.status === 'cancelled'
    ? `Order cancelled: ${input.reason}`
    : `Status changed to ${statusLabel}`;

  await recordOrderEvent(id, 'status_changed', description, {
    from: existing.status,
    to: input.status,
    reason: input.reason,
  });

  await eventBus.emit('order.status_updated', {
    orderId: id,
    oldStatus: existing.status,
    newStatus: input.status,
  });

  // Auto-create follow-up when order is completed
  if (input.status === 'completed') {
    try {
      const { followUps } = await import('@trayloop/database');
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 3); // 3 days after completion

      // Check if follow-up already exists for this order
      const [existing_followup] = await db.select({ id: followUps.id })
        .from(followUps)
        .where(eq(followUps.orderId, id))
        .limit(1);

      if (!existing_followup) {
        await db.insert(followUps).values({
          organizationId: orgId,
          orderId: id,
          status: 'pending',
          dueDate: followUpDate,
          note: 'Auto-created: check in with customer after completed order',
        });
      }
    } catch {}
  }

  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    previousStatus: existing.status,
    depositRequired,
    allowedTransitions: getAllowedTransitions(updated.status, depositRequired),
    updatedAt: updated.updatedAt,
  };
}

// --- Send deposit link ---

export async function sendDepositLink(orderId: string, orgId: string, input: SendDepositLinkInput, eventBus: EventBus) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      customerId: orders.customerId,
      locationId: orders.locationId,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  const depositRequired = await getDepositRequired(order.locationId);
  if (!depositRequired) {
    throw new ValidationError('This location does not require deposits. Confirm the order directly.');
  }

  const allowed = getAllowedTransitions(order.status, depositRequired);
  if (!allowed.includes('awaiting_deposit') && order.status !== 'awaiting_deposit') {
    throw new ValidationError(
      `Cannot send deposit link for order in "${order.status}" status. ` +
      `Allowed transitions: ${allowed.join(', ')}`,
    );
  }

  const [[customer], [org]] = await Promise.all([
    db.select({ email: customers.email, firstName: customers.firstName })
      .from(customers).where(eq(customers.id, order.customerId)).limit(1),
    db.select({ stripeAccountId: organizations.stripeAccountId, name: organizations.name })
      .from(organizations).where(eq(organizations.id, orgId)).limit(1),
  ]);

  const depositAmount = input.depositAmount ?? order.totalAmount;

  // --- Stripe Checkout or fallback ---
  let paymentLink: string;
  let checkoutSessionId: string | null = null;

  if (isStripeEnabled() && org?.stripeAccountId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: depositAmount,
          product_data: {
            name: `Deposit for ${order.orderNumber}`,
            description: `Order deposit — ${org.name}`,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: Math.round(depositAmount * 0.05), // 5% platform fee
        transfer_data: {
          destination: org.stripeAccountId,
        },
      },
      customer_email: customer.email,
      metadata: {
        trayloop_order_id: order.id,
        trayloop_order_number: order.orderNumber,
        trayloop_org_id: orgId,
        trayloop_deposit: 'true',
      },
      success_url: `${process.env.MERCHANT_URL || 'http://localhost:3003'}/orders/${order.id}?deposit=success`,
      cancel_url: `${process.env.MERCHANT_URL || 'http://localhost:3003'}/orders/${order.id}?deposit=cancelled`,
    });

    paymentLink = session.url!;
    checkoutSessionId = session.id;
  } else {
    // Fallback: fake link when Stripe isn't configured
    paymentLink = `https://pay.trayloop.com/deposit/${crypto.randomUUID()}`;
  }

  // Transaction: create/replace deposit record + update order status
  const result = await db.transaction(async (tx) => {
    await tx.update(deposits).set({ status: 'refunded', updatedAt: new Date() })
      .where(and(eq(deposits.orderId, order.id), eq(deposits.status, 'pending')));

    const [deposit] = await tx.insert(deposits).values({
      orderId: order.id,
      amount: depositAmount,
      currency: 'USD',
      status: 'pending',
      stripeCheckoutSessionId: checkoutSessionId,
    }).returning();

    const [updated] = await tx.update(orders).set({ status: 'awaiting_deposit', updatedAt: new Date() })
      .where(eq(orders.id, order.id)).returning();

    return { deposit, order: updated };
  });

  try { await recordOrderEvent(order.id, 'deposit_link_sent', `Deposit link sent to ${customer.email} for $${(depositAmount / 100).toFixed(2)}`); } catch {}
  try { await eventBus.emit('order.status_updated', { orderId: order.id, oldStatus: order.status, newStatus: 'awaiting_deposit' }); } catch {}

  return {
    orderId: result.order.id, status: result.order.status, depositId: result.deposit.id,
    depositAmount: result.deposit.amount, currency: result.deposit.currency, paymentLink,
    stripeCheckoutSessionId: checkoutSessionId,
    sentTo: customer.email, depositRequired: true, allowedTransitions: getAllowedTransitions('awaiting_deposit', true),
  };
}

// --- Mark order as paid ---

export async function markPaid(orderId: string, orgId: string, eventBus: EventBus) {
  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      locationId: orders.locationId,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  if (order.status !== 'awaiting_deposit') {
    throw new ValidationError(
      `Order must be in "awaiting_deposit" status to mark as paid (currently "${order.status}")`,
    );
  }

  // Find the pending deposit
  const [pendingDeposit] = await db
    .select()
    .from(deposits)
    .where(and(eq(deposits.orderId, order.id), eq(deposits.status, 'pending')))
    .limit(1);

  if (!pendingDeposit) {
    throw new ValidationError('No pending deposit found for this order. Send a deposit link first.');
  }

  const depositRequired = await getDepositRequired(order.locationId);

  // Transaction: update deposit + update order status
  const now = new Date();
  const result = await db.transaction(async (tx) => {
    const [updatedDeposit] = await tx.update(deposits)
      .set({ status: 'paid', paidAt: now, updatedAt: now })
      .where(eq(deposits.id, pendingDeposit.id)).returning();

    const [updatedOrder] = await tx.update(orders)
      .set({ status: 'confirmed', updatedAt: now })
      .where(eq(orders.id, order.id)).returning();

    return { deposit: updatedDeposit, order: updatedOrder };
  });

  try { await recordOrderEvent(order.id, 'deposit_paid', `Deposit of $${(result.deposit.amount / 100).toFixed(2)} marked as paid`); } catch {}
  try { await recordOrderEvent(order.id, 'status_changed', 'Status changed to confirmed'); } catch {}
  try { await eventBus.emit('payment.completed', { paymentId: result.deposit.id, orderId: order.id, amount: result.deposit.amount }); } catch {}
  try { await eventBus.emit('order.status_updated', { orderId: order.id, oldStatus: 'awaiting_deposit', newStatus: 'confirmed' }); } catch {}

  return {
    orderId: result.order.id, status: result.order.status, previousStatus: 'awaiting_deposit',
    deposit: { id: result.deposit.id, amount: result.deposit.amount, currency: result.deposit.currency, status: result.deposit.status, paidAt: result.deposit.paidAt },
    depositRequired, allowedTransitions: getAllowedTransitions('confirmed', depositRequired), updatedAt: result.order.updatedAt,
  };
}

// --- Location validation (reusable) ---

async function validateLocation(orgId: string, locationId: string) {
  const [location] = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      city: locations.city,
      state: locations.state,
      zipCode: locations.zipCode,
      country: locations.country,
      phone: locations.phone,
      email: locations.email,
      isActive: locations.isActive,
    })
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.organizationId, orgId)))
    .limit(1);

  if (!location) {
    throw new ValidationError('Location not found for this organization');
  }
  if (!location.isActive) {
    throw new ValidationError(`Location "${location.name}" is currently inactive and not accepting orders`);
  }

  const [settings] = await db
    .select()
    .from(locationSettings)
    .where(eq(locationSettings.locationId, location.id))
    .limit(1);

  return { location, settings };
}

function validateServiceType(
  serviceType: string,
  settings: typeof locationSettings.$inferSelect | undefined,
) {
  if (!settings) return;

  const availableModes = getAvailableServiceModes(settings);
  if (availableModes.includes(serviceType)) {
    return;
  }

  const availableLabel = availableModes.map((mode) => SERVICE_MODE_LABELS[mode] ?? mode).join(', ');
  throw new ValidationError(
    `${SERVICE_MODE_LABELS[serviceType] ?? serviceType} is not available at this location. ` +
    `Available: ${availableLabel}`,
  );
}

function validateLeadTime(
  eventDate: Date,
  settings: typeof locationSettings.$inferSelect | undefined,
) {
  const now = new Date();
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const requiredHours = (settings?.leadTimeDays ?? 3) * 24;

  if (hoursUntilEvent < requiredHours) {
    const requiredDays = Math.ceil(requiredHours / 24);
    const earliestDate = new Date(now.getTime() + requiredHours * 60 * 60 * 1000);
    throw new ValidationError(
      `Event date requires ${requiredDays}-day lead time (${requiredHours} hours). ` +
      `Earliest available: ${earliestDate.toISOString().split('T')[0]}`,
    );
  }
}

// --- Create Order ---

export async function create(orgId: string, input: CreateOrderInput, eventBus: EventBus, customerUserId?: string) {
  const eventDate = new Date(input.eventDate);

  // 1. Validate location ownership, active status, and fetch settings
  const { location, settings } = await validateLocation(orgId, input.locationId);

  // 2. Validate service type against location capabilities
  validateServiceType(input.serviceType, settings);

  // 3. Validate lead time against location settings
  validateLeadTime(eventDate, settings);

  // 4. Calculate pricing via centralized pricing service
  //    Handles: package validation, headcount bounds, add-on validation, min order amount
  const pricing = await calculatePricing({
    headcount: input.headcount,
    packages: input.packages,
    addOns: input.addOns,
    locationId: input.locationId,
  });

  const { lineItems, total: totalAmount } = pricing;

  // 5. Execute all writes in a single transaction (uses existing db connection)
  const result = await db.transaction(async (tx) => {
    // 5a. Find or create customer (scoped to org)
    const [existingCustomer] = await tx
      .select({ id: customers.id, userId: customers.userId, phone: customers.phone, companyName: customers.companyName })
      .from(customers)
      .where(and(
        eq(customers.email, input.customer.email),
        eq(customers.organizationId, orgId),
      ))
      .limit(1);

    let customerId: string;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      if (customerUserId && existingCustomer.userId && existingCustomer.userId !== customerUserId) {
        throw new ValidationError('This email is already linked to a different customer account for this merchant');
      }
      await tx
        .update(customers)
        .set({
          userId: customerUserId ?? existingCustomer.userId ?? undefined,
          firstName: input.customer.firstName,
          lastName: input.customer.lastName,
          phone: input.customer.phone ?? existingCustomer.phone,
          companyName: input.customer.companyName ?? existingCustomer.companyName,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));
    } else {
      const [newCustomer] = await tx
        .insert(customers)
        .values({
          organizationId: orgId,
          userId: customerUserId,
          email: input.customer.email,
          firstName: input.customer.firstName,
          lastName: input.customer.lastName,
          phone: input.customer.phone,
          companyName: input.customer.companyName,
        })
        .returning();
      customerId = newCustomer.id;
    }

    // 5b. Save delivery address for new customers
    if (input.deliveryAddress) {
      const [existingAddr] = await tx
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customerId))
        .limit(1);

      if (!existingAddr) {
        await tx.insert(customerAddresses).values({
          customerId,
          label: 'default',
          ...input.deliveryAddress,
          isDefault: true,
        });
      }
    }

    // 5c. Create order
    const orderNumber = await generateOrderNumber(orgId, tx);
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        organizationId: orgId,
        locationId: input.locationId,
        customerId,
        status: 'submitted',
        serviceType: input.serviceType,
        totalAmount,
        currency: 'USD',
        headCount: input.headcount,
        scheduledAt: eventDate,
        notes: input.notes,
      })
      .returning();

    // 5d. Create order line items
    await tx.insert(orderItems).values(
      lineItems.map((item) => ({
        orderId: order.id,
        packageId: item.type === 'package' ? item.referenceId : null,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    );

    // 5e. Create recurring order if requested
    let recurringOrderId: string | null = null;
    if (input.recurring) {
      const [recurring] = await tx
        .insert(recurringOrders)
        .values({
          organizationId: orgId,
          locationId: input.locationId,
          customerId,
          packageId: input.packages[0].packageId,
          serviceType: input.serviceType,
          interval: input.recurring.interval,
          startDate: eventDate,
          endDate: input.recurring.endDate ? new Date(input.recurring.endDate) : null,
          nextOccurrence: eventDate,
          preferredDay: input.recurring.preferredDay,
          preferredTime: input.recurring.preferredTime,
          headCount: input.headcount,
          notes: input.notes,
          isActive: true,
        })
        .returning();
      recurringOrderId = recurring.id;
    }

    return { order, customerId, recurringOrderId };
  });

  // 6. Non-critical post-commit side effects
  try { await recordOrderEvent(result.order.id, 'order_created', `Order ${result.order.orderNumber} submitted`); } catch {}
  try { await eventBus.emit('order.created', { orderId: result.order.id, customerId: result.customerId, orgId }); } catch {}

  // 7. Return order summary
  return {
    id: result.order.id,
    orderNumber: result.order.orderNumber,
    status: result.order.status,
    serviceType: result.order.serviceType,
    customerId: result.customerId,
    headCount: result.order.headCount,
    scheduledAt: result.order.scheduledAt,
    notes: input.notes ?? null,
    customer: {
      firstName: input.customer.firstName,
      lastName: input.customer.lastName,
      email: input.customer.email,
      phone: input.customer.phone ?? null,
      company: input.customer.companyName ?? null,
    },
    location: {
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      country: location.country,
      phone: location.phone,
      email: location.email,
    },
    deliveryAddress: input.deliveryAddress ?? null,
    pricing: {
      packageSubtotal: pricing.packageSubtotal,
      addOnSubtotal: pricing.addOnSubtotal,
      total: pricing.total,
      currency: pricing.currency,
    },
    items: lineItems.map((item) => ({
      type: item.type,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    depositRequired: settings?.depositRequired ?? true,
    recurringOrderId: result.recurringOrderId,
    createdAt: result.order.createdAt,
  };
}

// --- Reorder ---

export async function reorder(sourceOrderId: string, orgId: string, input: ReorderInput, eventBus: EventBus) {
  // 1. Fetch source order + verify org ownership
  const [sourceOrder] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, sourceOrderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!sourceOrder) throw new NotFoundError('Order');

  // 2. Fetch source order items
  const sourceItems = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, sourceOrderId));

  if (sourceItems.length === 0) {
    throw new ValidationError('Source order has no items to reorder');
  }

  // 3. Reconstruct selections and track unavailable items
  const warnings: string[] = [];

  // 3a. Resolve packages — verify each is still active
  const { packages: packagesTable } = await import('@trayloop/database');
  const packageItems = sourceItems.filter((item) => item.packageId !== null);
  const packageSelections: Array<{ packageId: string; quantity: number }> = [];

  if (packageItems.length > 0) {
    const activePackages = await db
      .select({ id: packagesTable.id })
      .from(packagesTable)
      .where(eq(packagesTable.isActive, true));

    const activeIds = new Set(activePackages.map((p) => p.id));

    for (const item of packageItems) {
      if (activeIds.has(item.packageId!)) {
        packageSelections.push({ packageId: item.packageId!, quantity: 1 });
      } else {
        warnings.push(`Package "${item.name}" is no longer available and was not included`);
      }
    }
  }

  if (packageSelections.length === 0) {
    throw new ValidationError(
      'Cannot reorder: all packages from the source order are no longer available',
    );
  }

  // 3b. Resolve add-ons by name match
  const addOnItems = sourceItems.filter((item) => item.packageId === null);
  const resolvedAddOns: Array<{ addOnId: string; quantity: number }> = [];

  if (addOnItems.length > 0) {
    const { addOns: addOnsTable, catalogs } = await import('@trayloop/database');
    const orgAddOns = await db
      .select({ id: addOnsTable.id, name: addOnsTable.name })
      .from(addOnsTable)
      .innerJoin(catalogs, eq(catalogs.id, addOnsTable.catalogId))
      .where(and(eq(catalogs.organizationId, orgId), eq(addOnsTable.isActive, true)));

    for (const item of addOnItems) {
      const match = orgAddOns.find((a) => a.name === item.name);
      if (match) {
        resolvedAddOns.push({ addOnId: match.id, quantity: item.quantity });
      } else {
        warnings.push(`Add-on "${item.name}" is no longer available and was not included`);
      }
    }
  }

  const eventDate = new Date(input.eventDate);
  const headcount = input.headcount ?? sourceOrder.headCount ?? 1;

  // 5. Validate location is still active
  if (sourceOrder.locationId) {
    const { settings } = await validateLocation(orgId, sourceOrder.locationId);
    validateServiceType(sourceOrder.serviceType, settings);
    validateLeadTime(eventDate, settings);
  }

  // 6. Recalculate pricing — never copy old totals
  const pricing = await calculatePricing({
    headcount,
    packages: packageSelections,
    addOns: resolvedAddOns.length > 0 ? resolvedAddOns : undefined,
    locationId: sourceOrder.locationId ?? undefined,
  });

  const { lineItems, total: totalAmount } = pricing;

  // 7. Create new order in transaction (uses existing db connection)
  const result = await db.transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(orgId, tx);
    const [newOrder] = await tx.insert(orders).values({
      orderNumber, organizationId: orgId, locationId: sourceOrder.locationId,
      customerId: sourceOrder.customerId, status: 'submitted', totalAmount,
      serviceType: sourceOrder.serviceType,
      currency: 'USD', headCount: headcount, scheduledAt: eventDate,
      notes: input.notes ?? sourceOrder.notes,
    }).returning();

    await tx.insert(orderItems).values(
      lineItems.map((item) => ({
        orderId: newOrder.id,
        packageId: item.type === 'package' ? item.referenceId : null,
        name: item.name, description: item.description,
        quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice,
      })),
    );

    return newOrder;
  });

  try { await recordOrderEvent(result.id, 'order_created', `Order ${result.orderNumber} created (reorder)`); } catch {}
  try { await recordOrderEvent(sourceOrderId, 'reorder_created', `Reorder created: ${result.orderNumber}`); } catch {}
  try { await eventBus.emit('order.created', { orderId: result.id, customerId: sourceOrder.customerId, orgId }); } catch {}

  const depositRequired = await getDepositRequired(sourceOrder.locationId);
  const [customer] = await db
    .select({ firstName: customers.firstName, lastName: customers.lastName, email: customers.email })
    .from(customers).where(eq(customers.id, sourceOrder.customerId)).limit(1);

  return {
    id: result.id, orderNumber: result.orderNumber, reorderedFrom: sourceOrderId,
    status: result.status, serviceType: result.serviceType, eventDate: result.scheduledAt, headCount: result.headCount,
    customer: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email },
    pricing: { packageSubtotal: pricing.packageSubtotal, addOnSubtotal: pricing.addOnSubtotal, total: pricing.total, currency: pricing.currency },
    items: lineItems.map((item) => ({ type: item.type, name: item.name, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice })),
    depositRequired, allowedTransitions: getAllowedTransitions('submitted', depositRequired),
    warnings: warnings.length > 0 ? warnings : undefined, createdAt: result.createdAt,
  };
}

// --- Refund deposit ---

export async function refundDeposit(orderId: string, orgId: string, eventBus: EventBus) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      customerId: orders.customerId,
      organizationId: orders.organizationId,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  // Find the paid deposit
  const [deposit] = await db
    .select()
    .from(deposits)
    .where(and(eq(deposits.orderId, orderId), eq(deposits.status, 'paid')))
    .limit(1);

  if (!deposit) {
    throw new ValidationError('No paid deposit found to refund');
  }

  // Idempotency: if already refunded, return early
  if (deposit.status === 'refunded') {
    return { orderId, depositId: deposit.id, status: 'already_refunded' };
  }

  // Attempt Stripe refund if payment intent exists
  let stripeRefundId: string | null = null;

  if (deposit.stripePaymentIntentId && isStripeEnabled()) {
    try {
      const stripe = getStripe();
      const refund = await stripe.refunds.create({
        payment_intent: deposit.stripePaymentIntentId,
      });
      stripeRefundId = refund.id;
    } catch (err) {
      throw new ValidationError(`Stripe refund failed: ${(err as Error).message}`);
    }
  }

  const now = new Date();

  // Transaction: update deposit + order
  await db.transaction(async (tx) => {
    await tx.update(deposits).set({
      status: 'refunded',
      stripeRefundId,
      refundedAt: now,
      updatedAt: now,
    }).where(eq(deposits.id, deposit.id));

    await tx.update(orders).set({
      status: 'cancelled',
      updatedAt: now,
    }).where(eq(orders.id, orderId));
  });

  // Timeline
  try {
    await recordOrderEvent(orderId, 'deposit_refunded', `Deposit of $${(deposit.amount / 100).toFixed(2)} refunded${stripeRefundId ? ' via Stripe' : ''}`);
    await recordOrderEvent(orderId, 'status_changed', 'Order cancelled (deposit refunded)');
  } catch {}

  // Events
  try { await eventBus.emit('order.status_updated', { orderId, oldStatus: order.status, newStatus: 'cancelled' }); } catch {}

  // Notifications
  try {
    const { notifyDepositRefunded } = await import('../../lib/notifications.js');
    const [[customer], [org]] = await Promise.all([
      db.select({ userId: customers.userId, email: customers.email, firstName: customers.firstName, lastName: customers.lastName })
        .from(customers).where(eq(customers.id, order.customerId)).limit(1),
      db.select({ name: organizations.name, ownerId: organizations.ownerId })
        .from(organizations).where(eq(organizations.id, orgId)).limit(1),
    ]);
    if (customer && org) {
      await notifyDepositRefunded({
        orderId, orderNumber: order.orderNumber, merchantName: org.name,
        depositAmount: deposit.amount, currency: 'usd',
        customerUserId: customer.userId, customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        merchantOwnerUserId: org.ownerId,
      });
    }
  } catch (err) {
    logger.error('Failed to send refund notifications', { error: (err as Error).message });
  }

  return {
    orderId,
    depositId: deposit.id,
    refundedAmount: deposit.amount,
    stripeRefundId,
    orderStatus: 'cancelled',
  };
}
