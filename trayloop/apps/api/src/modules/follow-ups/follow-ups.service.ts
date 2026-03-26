import { db } from '@trayloop/database';
import { followUps, orders, customers } from '@trayloop/database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreateFollowUpInput, UpdateFollowUpInput, FollowUpListQuery } from './follow-ups.schema.js';

// --- List ---

export async function listByOrg(orgId: string, query: FollowUpListQuery) {
  const conditions = [eq(followUps.organizationId, orgId)];

  if (query.status) {
    conditions.push(eq(followUps.status, query.status));
  }
  if (query.from) {
    conditions.push(gte(followUps.dueDate, new Date(query.from)));
  }
  if (query.to) {
    conditions.push(lte(followUps.dueDate, new Date(query.to)));
  }

  const where = conditions.length === 1 ? conditions[0] : and(...conditions)!;
  const offset = (query.page - 1) * query.pageSize;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: followUps.id,
        status: followUps.status,
        dueDate: followUps.dueDate,
        note: followUps.note,
        completedAt: followUps.completedAt,
        createdAt: followUps.createdAt,
        orderId: orders.id,
        orderStatus: orders.status,
        orderTotal: orders.totalAmount,
        orderCurrency: orders.currency,
        eventDate: orders.scheduledAt,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
      })
      .from(followUps)
      .innerJoin(orders, eq(orders.id, followUps.orderId))
      .innerJoin(customers, eq(customers.id, orders.customerId))
      .where(where)
      .orderBy(desc(followUps.dueDate))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(followUps)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    followUps: rows.map((r) => ({
      id: r.id,
      status: r.status,
      dueDate: r.dueDate,
      note: r.note,
      completedAt: r.completedAt,
      createdAt: r.createdAt,
      order: {
        id: r.orderId,
        status: r.orderStatus,
        eventDate: r.eventDate,
        total: r.orderTotal,
        currency: r.orderCurrency,
      },
      customer: {
        name: `${r.customerFirstName} ${r.customerLastName}`,
        email: r.customerEmail,
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

// --- Create ---

export async function create(orgId: string, input: CreateFollowUpInput) {
  // Verify order belongs to org
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, input.orderId), eq(orders.organizationId, orgId)))
    .limit(1);

  if (!order) {
    throw new NotFoundError('Order');
  }

  const [followUp] = await db
    .insert(followUps)
    .values({
      organizationId: orgId,
      orderId: input.orderId,
      dueDate: new Date(input.dueDate),
      note: input.note,
    })
    .returning();

  // Return with order context
  return getById(followUp.id, orgId);
}

// --- Update ---

export async function update(id: string, orgId: string, input: UpdateFollowUpInput) {
  const [existing] = await db
    .select({ status: followUps.status })
    .from(followUps)
    .where(and(eq(followUps.id, id), eq(followUps.organizationId, orgId)))
    .limit(1);

  if (!existing) throw new NotFoundError('Follow-up');

  if (existing.status === 'completed' && input.status !== 'pending') {
    throw new ValidationError('Follow-up is already completed. Reopen it by setting status to "pending".');
  }

  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
  if (input.note !== undefined) updateData.note = input.note;
  if (input.status !== undefined) {
    updateData.status = input.status;
    updateData.completedAt = input.status === 'completed' ? now : null;
  }

  await db
    .update(followUps)
    .set(updateData)
    .where(eq(followUps.id, id));

  return getById(id, orgId);
}

// --- Get by ID (internal helper) ---

async function getById(id: string, orgId: string) {
  const [row] = await db
    .select({
      id: followUps.id,
      status: followUps.status,
      dueDate: followUps.dueDate,
      note: followUps.note,
      completedAt: followUps.completedAt,
      createdAt: followUps.createdAt,
      updatedAt: followUps.updatedAt,
      orderId: orders.id,
      orderStatus: orders.status,
      orderTotal: orders.totalAmount,
      orderCurrency: orders.currency,
      eventDate: orders.scheduledAt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
    })
    .from(followUps)
    .innerJoin(orders, eq(orders.id, followUps.orderId))
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(and(eq(followUps.id, id), eq(followUps.organizationId, orgId)))
    .limit(1);

  if (!row) throw new NotFoundError('Follow-up');

  return {
    id: row.id,
    status: row.status,
    dueDate: row.dueDate,
    note: row.note,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    order: {
      id: row.orderId,
      status: row.orderStatus,
      eventDate: row.eventDate,
      total: row.orderTotal,
      currency: row.orderCurrency,
    },
    customer: {
      name: `${row.customerFirstName} ${row.customerLastName}`,
      email: row.customerEmail,
    },
  };
}
