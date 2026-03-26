import { z } from 'zod';

export const memberRole = z.enum(['owner', 'admin', 'manager', 'staff']);

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: memberRole.default('staff'),
});

export const updateMemberRoleSchema = z.object({
  role: memberRole,
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
