import { db } from '@trayloop/database';
import { customers, orders } from '@trayloop/database';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerListQuery } from './customers.schema.js';

export async function listByOrg(orgId: string, query: CustomerListQuery) {
  const { page, pageSize, search } = query;
  const offset = (page - 1) * pageSize;

  const searchTerm = search ? `%${search}%` : null;
  const whereClause = searchTerm
    ? and(
        eq(customers.organizationId, orgId),
        or(
          ilike(customers.firstName, searchTerm),
          ilike(customers.lastName, searchTerm),
          ilike(customers.email, searchTerm),
          ilike(customers.companyName, searchTerm),
        ),
      )
    : eq(customers.organizationId, orgId);

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: customers.id,
        email: customers.email,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        companyName: customers.companyName,
        isActive: customers.isActive,
        createdAt: customers.createdAt,
        orderCount: sql<number>`(select count(*)::int from orders where orders.customer_id = customers.id)`,
        totalSpend: sql<number>`(select coalesce(sum(total_amount), 0)::int from orders where orders.customer_id = customers.id)`,
        lastOrderDate: sql<string | null>`(select max(scheduled_at)::text from orders where orders.customer_id = customers.id)`,
      })
      .from(customers)
      .where(whereClause)
      .orderBy(desc(customers.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(whereClause),
  ]);

  const total = totalRow[0]?.count ?? 0;

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      phone: r.phone,
      company: r.companyName,
      isActive: r.isActive,
      createdAt: r.createdAt,
      orderCount: r.orderCount,
      totalSpend: r.totalSpend,
      lastOrderDate: r.lastOrderDate,
    })),
    total,
    page,
    pageSize,
    hasMore: offset + rows.length < total,
  };
}

export async function getById(id: string, orgId: string) {
  const [customer] = await db
    .select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      companyName: customers.companyName,
      notes: customers.notes,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
    })
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .limit(1);

  if (!customer) throw new NotFoundError('Customer');

  // Fetch recent orders
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      scheduledAt: orders.scheduledAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  const totalSpend = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    company: customer.companyName,
    notes: customer.notes,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    orderCount: recentOrders.length,
    totalSpend,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.totalAmount,
      eventDate: o.scheduledAt,
      createdAt: o.createdAt,
    })),
  };
}

export async function create(orgId: string, input: CreateCustomerInput) {
  const [customer] = await db
    .insert(customers)
    .values({ organizationId: orgId, ...input })
    .returning();

  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    companyName: customer.companyName,
    createdAt: customer.createdAt,
  };
}

export async function update(id: string, orgId: string, input: UpdateCustomerInput) {
  const [updated] = await db
    .update(customers)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .returning();

  if (!updated) throw new NotFoundError('Customer');

  return {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    companyName: updated.companyName,
    updatedAt: updated.updatedAt,
  };
}
