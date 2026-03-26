import type { CreatePackageInput, UpdatePackageInput } from './packages.schema.js';

export async function listByOrg(orgId: string) {
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  throw new Error('Not implemented');
}

export async function create(input: CreatePackageInput) {
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdatePackageInput) {
  throw new Error('Not implemented');
}
