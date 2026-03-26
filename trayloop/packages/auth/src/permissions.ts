import type { UserRole } from '@trayloop/types';

const roleHierarchy: Record<UserRole, number> = {
  customer: 0,
  merchant: 1,
  admin: 2,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isMerchant(role: UserRole): boolean {
  return role === 'merchant' || role === 'admin';
}
