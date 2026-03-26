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
} from '@trayloop/database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { calculatePricing } from '../../lib/pricing.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput, OrderListQuery, SendDepositLinkInput } from './orders.schema.js';

// --- Status transition rules ---
// Deposit required:  submitted → awaiting_deposit → confirmed → completed
// No deposit:        submitted → confirmed → completed
// Cancellation allowed from any non-terminal state

const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

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

async function getDepositRequired(locationId: string | null): Promise<boolean> {
  if (!locationId) return true;
  const [settings] = await db
    .select({ depositRequired: locationSettings.depositRequired })
    .from(locationSettings)
    .where(eq(locationSettings.locationId, locationId))
    .limit(1);
  return settings?.depositRequired ?? true;
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
        status: orders.status,
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
      status: r.status,
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
  const [items, [customer], locationRow, [address]] = await Promise.all([
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
  ]);

  // Compute pricing breakdown from line items
  const packageItems = items.filter((i) => i.packageId !== null);
  const addOnItems = items.filter((i) => i.packageId === null);
  const packageSubtotal = packageItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const addOnSubtotal = addOnItems.reduce((sum, i) => sum + i.totalPrice, 0);

  // Determine allowed status transitions based on location deposit setting
  const depositRequired = await getDepositRequired(order.locationId);
  const allowedTransitions = getAllowedTransitions(order.status, depositRequired);

  return {
    id: order.id,
    status: order.status,
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

  await eventBus.emit('order.status_updated', {
    orderId: id,
    oldStatus: existing.status,
    newStatus: input.status,
  });

  return {
    id: updated.id,
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
      status: orders.status,
      totalAmount: orders.totalAmount,
      customerId: orders.customerId,
      locationId: orders.locationId,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  // Must require deposits
  const depositRequired = await getDepositRequired(order.locationId);
  if (!depositRequired) {
    throw new ValidationError('This location does not require deposits. Confirm the order directly.');
  }

  // Must be in a status that allows transitioning to awaiting_deposit
  const allowed = getAllowedTransitions(order.status, depositRequired);
  if (!allowed.includes('awaiting_deposit') && order.status !== 'awaiting_deposit') {
    throw new ValidationError(
      `Cannot send deposit link for order in "${order.status}" status. ` +
      `Allowed transitions: ${allowed.join(', ')}`,
    );
  }

  const [customer] = await db
    .select({ email: customers.email, firstName: customers.firstName })
    .from(customers)
    .where(eq(customers.id, order.customerId))
    .limit(1);

  const depositAmount = input.depositAmount ?? order.totalAmount;

  // Generate a placeholder payment link (UUID-based, will be Stripe later)
  const fakeLinkId = crypto.randomUUID();
  const paymentLink = `https://pay.trayloop.com/deposit/${fakeLinkId}`;

  // Transaction: create/replace deposit record + update order status
  const connectionString = process.env.DATABASE_URL!;
  const txSql = postgres(connectionString);

  try {
    const result = await txSql.begin(async (tx) => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const txDb = drizzle(tx);

      // Cancel any existing pending deposit for this order
      await txDb
        .update(deposits)
        .set({ status: 'refunded', updatedAt: new Date() })
        .where(and(eq(deposits.orderId, order.id), eq(deposits.status, 'pending')));

      // Create new deposit record
      const [deposit] = await txDb
        .insert(deposits)
        .values({
          orderId: order.id,
          amount: depositAmount,
          currency: 'USD',
          status: 'pending',
          stripePaymentIntentId: fakeLinkId,
        })
        .returning();

      // Update order status to awaiting_deposit
      const [updated] = await txDb
        .update(orders)
        .set({ status: 'awaiting_deposit', updatedAt: new Date() })
        .where(eq(orders.id, order.id))
        .returning();

      return { deposit, order: updated };
    });

    await eventBus.emit('order.status_updated', {
      orderId: order.id,
      oldStatus: order.status,
      newStatus: 'awaiting_deposit',
    });

    return {
      orderId: result.order.id,
      status: result.order.status,
      depositId: result.deposit.id,
      depositAmount: result.deposit.amount,
      currency: result.deposit.currency,
      paymentLink,
      sentTo: customer.email,
      depositRequired: true,
      allowedTransitions: getAllowedTransitions('awaiting_deposit', true),
    };
  } finally {
    await txSql.end();
  }
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
  const connectionString = process.env.DATABASE_URL!;
  const txSql = postgres(connectionString);

  try {
    const result = await txSql.begin(async (tx) => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const txDb = drizzle(tx);

      // Mark deposit as paid
      const now = new Date();
      const [updatedDeposit] = await txDb
        .update(deposits)
        .set({
          status: 'paid',
          paidAt: now,
          updatedAt: now,
        })
        .where(eq(deposits.id, pendingDeposit.id))
        .returning();

      // Transition order to confirmed
      const [updatedOrder] = await txDb
        .update(orders)
        .set({
          status: 'confirmed',
          updatedAt: now,
        })
        .where(eq(orders.id, order.id))
        .returning();

      return { deposit: updatedDeposit, order: updatedOrder };
    });

    await eventBus.emit('payment.completed', {
      paymentId: result.deposit.id,
      orderId: order.id,
      amount: result.deposit.amount,
    });

    await eventBus.emit('order.status_updated', {
      orderId: order.id,
      oldStatus: 'awaiting_deposit',
      newStatus: 'confirmed',
    });

    return {
      orderId: result.order.id,
      status: result.order.status,
      previousStatus: 'awaiting_deposit',
      deposit: {
        id: result.deposit.id,
        amount: result.deposit.amount,
        currency: result.deposit.currency,
        status: result.deposit.status,
        paidAt: result.deposit.paidAt,
      },
      depositRequired,
      allowedTransitions: getAllowedTransitions('confirmed', depositRequired),
      updatedAt: result.order.updatedAt,
    };
  } finally {
    await txSql.end();
  }
}

// --- Location validation (reusable) ---

async function validateLocation(orgId: string, locationId: string) {
  const [location] = await db
    .select({ id: locations.id, name: locations.name, isActive: locations.isActive })
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

  if (serviceType === 'delivery' && !settings.deliveryEnabled) {
    throw new ValidationError(
      'Delivery is not available at this location. Available: pickup',
    );
  }
  if (serviceType === 'pickup' && !settings.pickupEnabled) {
    throw new ValidationError(
      'Pickup is not available at this location. Available: delivery',
    );
  }
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

export async function create(orgId: string, input: CreateOrderInput, eventBus: EventBus) {
  const eventDate = new Date(input.eventDate);

  // 1. Validate location ownership, active status, and fetch settings
  const { settings } = await validateLocation(orgId, input.locationId);

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

  // 5. Execute all writes in a single transaction
  const connectionString = process.env.DATABASE_URL!;
  const txSql = postgres(connectionString);

  try {
    const result = await txSql.begin(async (tx) => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const txDb = drizzle(tx);

      // 5a. Find or create customer (scoped to org)
      const [existingCustomer] = await txDb
        .select()
        .from(customers)
        .where(and(
          eq(customers.email, input.customer.email),
          eq(customers.organizationId, orgId),
        ))
        .limit(1);

      let customerId: string;
      if (existingCustomer) {
        customerId = existingCustomer.id;
        await txDb
          .update(customers)
          .set({
            firstName: input.customer.firstName,
            lastName: input.customer.lastName,
            phone: input.customer.phone ?? existingCustomer.phone,
            companyName: input.customer.companyName ?? existingCustomer.companyName,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customerId));
      } else {
        const [newCustomer] = await txDb
          .insert(customers)
          .values({
            organizationId: orgId,
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
        const [existingAddr] = await txDb
          .select({ id: customerAddresses.id })
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, customerId))
          .limit(1);

        if (!existingAddr) {
          await txDb.insert(customerAddresses).values({
            customerId,
            label: 'default',
            ...input.deliveryAddress,
            isDefault: true,
          });
        }
      }

      // 5c. Create order — status always starts as "submitted"
      const [order] = await txDb
        .insert(orders)
        .values({
          organizationId: orgId,
          locationId: input.locationId,
          customerId,
          status: 'submitted',
          totalAmount,
          currency: 'USD',
          headCount: input.headcount,
          scheduledAt: eventDate,
          notes: input.notes,
        })
        .returning();

      // 5d. Create order line items from pricing result
      await txDb.insert(orderItems).values(
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
        const [recurring] = await txDb
          .insert(recurringOrders)
          .values({
            organizationId: orgId,
            locationId: input.locationId,
            customerId,
            packageId: input.packages[0].packageId,
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

    // 6. Emit events after successful commit
    await eventBus.emit('order.created', {
      orderId: result.order.id,
      customerId: result.customerId,
      orgId,
    });

    // 7. Return order summary with full pricing breakdown
    return {
      id: result.order.id,
      status: result.order.status,
      headCount: result.order.headCount,
      scheduledAt: result.order.scheduledAt,
      customer: {
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
      },
      pricing: {
        packageSubtotal: pricing.packageSubtotal,
        addOnSubtotal: pricing.addOnSubtotal,
        total: pricing.total,
        currency: pricing.currency,
      },
      items: lineItems.map((item) => ({
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      recurringOrderId: result.recurringOrderId,
      createdAt: result.order.createdAt,
    };
  } finally {
    await txSql.end();
  }
}
