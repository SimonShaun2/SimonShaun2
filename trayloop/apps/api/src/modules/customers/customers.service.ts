import { db } from '@trayloop/database';
import { customers } from '@trayloop/database';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.schema.js';

export async function listByOrg(orgId: string) {
  return db
    .select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      companyName: customers.companyName,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .where(eq(customers.organizationId, orgId));
}

export async function getById(id: string) {
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
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer) throw new NotFoundError('Customer');
  return customer;
}

export async function create(orgId: string, input: CreateCustomerInput) {
  const [customer] = await db
    .insert(customers)
    .values({
      organizationId: orgId,
      ...input,
    })
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

export async function update(id: string, input: UpdateCustomerInput) {
  const [updated] = await db
    .update(customers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(customers.id, id))
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
