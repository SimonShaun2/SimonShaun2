import { db } from '@trayloop/database';
import { users, organizations, orders } from '@trayloop/database';
import { sql } from 'drizzle-orm';

export async function listOrganizations() {
  return db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    isActive: organizations.isActive,
    createdAt: organizations.createdAt,
  }).from(organizations);
}

export async function listUsers() {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users);
}

export async function getPlatformStats() {
  const [[orgCount], [userCount], [orderStats]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(organizations),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db.select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(total_amount), 0)::int`,
    }).from(orders),
  ]);

  return {
    organizations: orgCount.count,
    users: userCount.count,
    orders: orderStats.count,
    revenue: orderStats.revenue,
  };
}

export async function updateOrgStatus(orgId: string, status: string) {
  // TODO: Implement org status update
  return { id: orgId, status };
}

export async function updateUserStatus(userId: string, status: string) {
  // TODO: Implement user status update
  return { id: userId, status };
}
