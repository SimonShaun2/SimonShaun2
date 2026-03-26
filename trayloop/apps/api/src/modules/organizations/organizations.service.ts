import type { CreateOrganizationInput, UpdateOrganizationInput } from './organizations.schema.js';

export async function create(userId: string, input: CreateOrganizationInput) {
  // TODO: Create organization, assign owner membership
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  // TODO: Fetch organization by ID
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdateOrganizationInput) {
  // TODO: Update organization
  throw new Error('Not implemented');
}
