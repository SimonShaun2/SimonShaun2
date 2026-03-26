export async function findByOrgId(orgId: string) {
  // TODO: Query catalog_items table
  throw new Error('Not implemented');
}

export async function findById(id: string) {
  throw new Error('Not implemented');
}

export async function insert(data: Record<string, unknown>) {
  throw new Error('Not implemented');
}

export async function updateById(id: string, data: Record<string, unknown>) {
  throw new Error('Not implemented');
}

export async function archiveById(id: string) {
  // TODO: Soft-delete by setting is_active = false
  throw new Error('Not implemented');
}
