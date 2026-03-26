import type { CreateCustomerInput, UpdateCustomerInput } from './customers.schema.js';

export async function listByOrg(orgId: string) {
  // TODO: Query customers by organization_id
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  // TODO: Fetch customer by ID
  throw new Error('Not implemented');
}

export async function create(orgId: string, input: CreateCustomerInput) {
  // TODO: Insert customer with organizationId = orgId
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdateCustomerInput) {
  // TODO: Update customer by ID
  throw new Error('Not implemented');
}
