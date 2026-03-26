import { db } from '@trayloop/database';
import {
  orders,
  orderItems,
  recurringOrders,
  customers,
  customerAddresses,
  locations,
  locationSettings,
} from '@trayloop/database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { calculatePricing } from '../../lib/pricing.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput, OrderListQuery, SendPaymentLinkInput } from './orders.schema.js';

// --- Status transition rules ---

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ['awaiting_deposit', 'confirmed', 'cancelled'],
  awaiting_deposit: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

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
        createdAt: orders.createdAt,
        locationName: locations.name,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
        customerCompany: customers.companyName,
      })
      .from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId))
      .leftJoin(locations, eq(locations.id, orders.locationId))
      .where(where)
      .orderBy(desc(orders.createdAt))
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
      totalAmount: r.totalAmount,
      currency: r.currency,
      headCount: r.headCount,
      scheduledAt: r.scheduledAt,
      createdAt: r.createdAt,
      location: r.locationName,
      customer: {
        name: `${r.customerFirstName} ${r.customerLastName}`,
        email: r.customerEmail,
        company: r.customerCompany,
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
  return db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      headCount: orders.headCount,
      scheduledAt: orders.scheduledAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

// --- Get order detail ---

export async function getById(id: string, orgId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  const [items, [customer], [location]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db
      .select({
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
          .select({ name: locations.name, address: locations.address, city: locations.city, state: locations.state })
          .from(locations)
          .where(eq(locations.id, order.locationId))
          .limit(1)
      : Promise.resolve([null]),
  ]);

  // Fetch delivery address if exists
  const [address] = await db
    .select({
      address: customerAddresses.address,
      city: customerAddresses.city,
      state: customerAddresses.state,
      zipCode: customerAddresses.zipCode,
    })
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, order.customerId))
    .limit(1);

  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    headCount: order.headCount,
    scheduledAt: order.scheduledAt,
    completedAt: order.completedAt,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    location: location
      ? { name: location.name, address: location.address, city: location.city, state: location.state }
      : null,
    customer: {
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      company: customer.companyName,
    },
    deliveryAddress: address ?? null,
    items: items.map((i) => ({
      name: i.name,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
  };
}

// --- Update order status ---

export async function updateStatus(id: string, orgId: string, input: UpdateOrderStatusInput, eventBus: EventBus) {
  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!existing) throw new NotFoundError('Order');

  const allowed = VALID_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes(input.status)) {
    throw new ValidationError(
      `Cannot transition from "${existing.status}" to "${input.status}"`,
    );
  }

  const completedAt = input.status === 'completed' ? new Date() : undefined;

  const [updated] = await db
    .update(orders)
    .set({
      status: input.status,
      completedAt,
      updatedAt: new Date(),
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
    updatedAt: updated.updatedAt,
  };
}

// --- Send payment link (stub) ---

export async function sendPaymentLink(orgId: string, input: SendPaymentLinkInput) {
  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      customerId: orders.customerId,
    })
    .from(orders)
    .where(and(eq(orders.id, input.orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) throw new NotFoundError('Order');

  if (order.status !== 'submitted' && order.status !== 'awaiting_deposit') {
    throw new ValidationError('Payment link can only be sent for submitted or awaiting_deposit orders');
  }

  const [customer] = await db
    .select({ email: customers.email, firstName: customers.firstName })
    .from(customers)
    .where(eq(customers.id, order.customerId))
    .limit(1);

  // Update status to awaiting_deposit
  await db
    .update(orders)
    .set({ status: 'awaiting_deposit', updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  // TODO: Create Stripe payment link and send email
  return {
    orderId: order.id,
    status: 'awaiting_deposit',
    depositAmount: input.depositAmount ?? order.totalAmount,
    sentTo: customer.email,
    message: `Payment link will be sent to ${customer.firstName} at ${customer.email}`,
  };
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
