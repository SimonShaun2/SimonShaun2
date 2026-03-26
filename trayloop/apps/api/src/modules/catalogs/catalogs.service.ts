import type { CreateCatalogItemInput, UpdateCatalogItemInput } from './catalogs.schema.js';

export async function listByOrg(orgId: string) {
  // TODO: Query catalogs by organization_id
  throw new Error('Not implemented');
}

export async function getById(id: string) {
  // TODO: Fetch catalog by ID
  throw new Error('Not implemented');
}

export async function create(orgId: string, input: CreateCatalogItemInput) {
  // TODO: Insert catalog with organizationId = orgId
  throw new Error('Not implemented');
}

export async function update(id: string, input: UpdateCatalogItemInput) {
  // TODO: Update catalog by ID
  throw new Error('Not implemented');
}

export async function archive(id: string) {
  // TODO: Soft-delete catalog by setting is_active = false
  throw new Error('Not implemented');
}
