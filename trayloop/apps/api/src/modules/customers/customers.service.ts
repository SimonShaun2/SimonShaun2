import type { CreateCustomerInput, UpdateCustomerInput } from './customers.schema.js';

export async function listByOrg(orgId: string) {
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  throw new Error('Not implemented');
}

export async function create(input: CreateCustomerInput) {
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdateCustomerInput) {
  throw new Error('Not implemented');
}
