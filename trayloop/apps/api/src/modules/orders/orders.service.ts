import { db } from '@trayloop/database';
import {
  orders,
  orderItems,
  recurringOrders,
  customers,
  customerAddresses,
  locations,
  locationSettings,
  packages,
  addOns,
} from '@trayloop/database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
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

// --- Create Order (storefront submission) ---

export async function create(orgId: string, input: CreateOrderInput, eventBus: EventBus) {
  // 1. Validate location belongs to org and is active
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, input.locationId), eq(locations.organizationId, orgId), eq(locations.isActive, true)))
    .limit(1);

  if (!location) {
    throw new ValidationError('Location not found or inactive');
  }

  // 2. Fetch location settings for validation
  const [settings] = await db
    .select()
    .from(locationSettings)
    .where(eq(locationSettings.locationId, location.id))
    .limit(1);

  // 3. Validate service type
  if (settings) {
    if (input.serviceType === 'delivery' && !settings.deliveryEnabled) {
      throw new ValidationError('Delivery is not available at this location');
    }
    if (input.serviceType === 'pickup' && !settings.pickupEnabled) {
      throw new ValidationError('Pickup is not available at this location');
    }
  }

  // 4. Validate lead time
  const eventDate = new Date(input.eventDate);
  const now = new Date();
  const leadTimeMs = eventDate.getTime() - now.getTime();
  const leadTimeHours = leadTimeMs / (1000 * 60 * 60);
  const requiredLeadTimeHours = (settings?.leadTimeDays ?? 3) * 24;

  if (leadTimeHours < requiredLeadTimeHours) {
    throw new ValidationError(
      `Event date must be at least ${requiredLeadTimeHours} hours from now (${Math.ceil(requiredLeadTimeHours / 24)} days lead time)`,
    );
  }

  // 5. Fetch and validate packages — server-side pricing
  const packageIds = input.packages.map((p) => p.packageId);
  const packageRows = await db
    .select()
    .from(packages)
    .where(eq(packages.isActive, true));

  const selectedPackages = packageRows.filter((p) => packageIds.includes(p.id));

  if (selectedPackages.length !== packageIds.length) {
    throw new ValidationError('One or more selected packages not found or inactive');
  }

  for (const pkg of selectedPackages) {
    if (pkg.minHeadCount && input.headcount < pkg.minHeadCount) {
      throw new ValidationError(`Package "${pkg.name}" requires minimum ${pkg.minHeadCount} headcount`);
    }
    if (pkg.maxHeadCount && input.headcount > pkg.maxHeadCount) {
      throw new ValidationError(`Package "${pkg.name}" allows maximum ${pkg.maxHeadCount} headcount`);
    }
  }

  // 6. Calculate pricing — NEVER trust frontend prices
  const lineItems: Array<{
    packageId: string | null;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> = [];

  for (const selection of input.packages) {
    const pkg = selectedPackages.find((p) => p.id === selection.packageId)!;
    const unitPrice = pkg.price;
    const quantity = pkg.pricing === 'per_head' ? input.headcount * selection.quantity : selection.quantity;
    const totalPrice = unitPrice * quantity;

    lineItems.push({
      packageId: pkg.id,
      name: pkg.name,
      description: pkg.description,
      quantity,
      unitPrice,
      totalPrice,
    });
  }

  // 7. Fetch and price add-ons
  if (input.addOns && input.addOns.length > 0) {
    const addOnIds = input.addOns.map((a) => a.addOnId);
    const addOnRows = await db.select().from(addOns).where(eq(addOns.isActive, true));
    const selectedAddOns = addOnRows.filter((a) => addOnIds.includes(a.id));

    if (selectedAddOns.length !== addOnIds.length) {
      throw new ValidationError('One or more selected add-ons not found or inactive');
    }

    for (const selection of input.addOns) {
      const addOn = selectedAddOns.find((a) => a.id === selection.addOnId)!;
      lineItems.push({
        packageId: null,
        name: addOn.name,
        description: addOn.description,
        quantity: selection.quantity,
        unitPrice: addOn.price,
        totalPrice: addOn.price * selection.quantity,
      });
    }
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // 8. Validate minimum order amount
  if (settings?.minOrderAmount && totalAmount < settings.minOrderAmount) {
    throw new ValidationError(
      `Order total ($${(totalAmount / 100).toFixed(2)}) is below minimum ($${(settings.minOrderAmount / 100).toFixed(2)})`,
    );
  }

  // 9. Execute in transaction
  const connectionString = process.env.DATABASE_URL!;
  const txSql = postgres(connectionString);

  try {
    const result = await txSql.begin(async (tx) => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const txDb = drizzle(tx);

      // 9a. Find or create customer
      const [existingCustomer] = await txDb
        .select()
        .from(customers)
        .where(and(eq(customers.email, input.customer.email), eq(customers.organizationId, orgId)))
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

      // 9b. Save delivery address
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

      // 9c. Create order with status=submitted
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

      // 9d. Create order items
      await txDb.insert(orderItems).values(
        lineItems.map((item) => ({
          orderId: order.id,
          packageId: item.packageId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      );

      // 9e. Create recurring order if applicable
      let recurringOrderId: string | null = null;
      if (input.recurring) {
        const primaryPkg = input.packages[0];
        const [recurring] = await txDb
          .insert(recurringOrders)
          .values({
            organizationId: orgId,
            locationId: input.locationId,
            customerId,
            packageId: primaryPkg.packageId,
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

    await eventBus.emit('order.created', {
      orderId: result.order.id,
      customerId: result.customerId,
      orgId,
    });

    return {
      id: result.order.id,
      status: result.order.status,
      totalAmount: result.order.totalAmount,
      currency: result.order.currency,
      headCount: result.order.headCount,
      scheduledAt: result.order.scheduledAt,
      customer: {
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
      },
      items: lineItems.map((item) => ({
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
