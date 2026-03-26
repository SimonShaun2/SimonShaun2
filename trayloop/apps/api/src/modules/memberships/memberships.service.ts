import type { InviteMemberInput, UpdateMemberRoleInput } from './memberships.schema.js';

export async function listByOrg(orgId: string) {
  // TODO: List all members for an organization
  throw new Error('Not implemented');
}

export async function invite(input: InviteMemberInput) {
  // TODO: Create membership invitation
  throw new Error('Not implemented');
}

export async function updateRole(id: string, input: UpdateMemberRoleInput) {
  // TODO: Update member role
  throw new Error('Not implemented');
}

export async function remove(id: string) {
  // TODO: Remove member from organization
  throw new Error('Not implemented');
}
