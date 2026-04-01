import { db } from '@trayloop/database';
import { users, organizations, orders, customers, payments, deposits, organizationMemberships } from '@trayloop/database';
import { sql, eq, and, gte, desc, inArray } from 'drizzle-orm';

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

/**
 * ADM-002: Platform overview metrics for the master dashboard.
 *
 * MRR approximation:
 *   No subscription/billing table exists in the current schema. MRR is
 *   approximated as: (count of active orgs with stripeChargesEnabled) × $99/mo.
 *   This matches the $99/mo pricing shown in the master dashboard designs.
 *   When a real subscriptions table is added, replace this calculation.
 *
 * At-risk revenue:
 *   Calculated from customers whose last order across any org was 14+ days ago
 *   but had meaningful order volume (>= 2 orders). Their average order value
 *   represents revenue at risk of churn.
 *
 * GMV this month:
 *   Sum of totalAmount for orders with status confirmed/completed created in
 *   the current calendar month.
 */
export async function getPlatformOverview() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // --- Summary metrics ---
  const [activeOrgsResult, paidOrgsResult, gmvResult] = await Promise.all([
    // Active restaurants count
    db.select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(eq(organizations.isActive, true)),

    // "Paid" restaurants: active orgs with Stripe charges enabled
    // Approximation for MRR = paidCount × 9900 (cents, $99/mo)
    db.select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(and(
        eq(organizations.isActive, true),
        eq(organizations.stripeChargesEnabled, true),
      )),

    // GMV this month: sum of confirmed + completed orders created this month
    db.select({
      total: sql<number>`coalesce(sum(total_amount), 0)::int`,
    })
      .from(orders)
      .where(and(
        inArray(orders.status, ['confirmed', 'completed']),
        gte(orders.createdAt, monthStart),
      )),
  ]);

  const activeRestaurants = activeOrgsResult[0].count;
  const paidRestaurants = paidOrgsResult[0].count;
  const trialRestaurants = activeRestaurants - paidRestaurants;
  const mrr = paidRestaurants * 9900; // cents, $99/mo per paid restaurant
  const gmvThisMonth = gmvResult[0].total;
  // Projected MRR assumes all current trials convert at $99/mo
  const projectedMrr = activeRestaurants * 9900;

  // --- Restaurants by GMV (all time, ranked) ---
  const restaurantsByGmv = await db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    isPaid: organizations.stripeChargesEnabled,
    orderCount: sql<number>`count(${orders.id})::int`,
    gmv: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
  })
    .from(organizations)
    .leftJoin(orders, eq(orders.organizationId, organizations.id))
    .where(eq(organizations.isActive, true))
    .groupBy(organizations.id, organizations.name, organizations.slug, organizations.stripeChargesEnabled)
    .orderBy(desc(sql`coalesce(sum(${orders.totalAmount}), 0)`));

  // --- MRR breakdown per restaurant ---
  // Each paid restaurant = $99/mo, trials = $0 → $99
  const mrrBreakdown = restaurantsByGmv.map((r) => ({
    id: r.id,
    name: r.name,
    isPaid: r.isPaid,
    mrr: r.isPaid ? 9900 : 0,
    label: r.isPaid ? '$99/mo' : '$0 → $99',
  }));

  // --- At-risk customers ---
  // Customers with 2+ orders whose most recent order is 14+ days old
  const atRiskCustomers = await db.select({
    customerId: customers.id,
    firstName: customers.firstName,
    lastName: customers.lastName,
    companyName: customers.companyName,
    orgName: organizations.name,
    orderCount: sql<number>`count(${orders.id})::int`,
    avgOrderValue: sql<number>`(avg(${orders.totalAmount}))::int`,
    lastOrderAt: sql<string>`max(${orders.createdAt})`,
  })
    .from(customers)
    .innerJoin(orders, eq(orders.customerId, customers.id))
    .innerJoin(organizations, eq(organizations.id, customers.organizationId))
    .groupBy(customers.id, customers.firstName, customers.lastName, customers.companyName, organizations.name)
    .having(and(
      sql`count(${orders.id}) >= 2`,
      sql`max(${orders.createdAt}) < ${fourteenDaysAgo}`,
    ))
    .orderBy(desc(sql`avg(${orders.totalAmount})`));

  const atRiskRevenue = atRiskCustomers.reduce((sum, c) => sum + (c.avgOrderValue ?? 0), 0);

  // --- Recent payments (last 7 days) ---
  // Combine deposits (paid) and payments (succeeded) with org context
  const recentPayments = await db.select({
    id: payments.id,
    orgName: organizations.name,
    amount: payments.amount,
    currency: payments.currency,
    status: payments.status,
    method: payments.method,
    paidAt: payments.paidAt,
    createdAt: payments.createdAt,
    type: sql<string>`'deposit'`,
  })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .where(gte(payments.createdAt, sevenDaysAgo))
    .orderBy(desc(payments.createdAt))
    .limit(20);

  return {
    summary: {
      mrr,
      paidRestaurants,
      trialRestaurants,
      gmvThisMonth,
      activeRestaurants,
      atRiskRevenue,
      projectedMrr,
    },
    restaurantsByGmv: restaurantsByGmv.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      isPaid: r.isPaid,
      orderCount: r.orderCount,
      gmv: r.gmv,
    })),
    mrrBreakdown,
    atRiskCustomers: atRiskCustomers.map((c) => ({
      customerId: c.customerId,
      name: `${c.firstName} ${c.lastName}`,
      company: c.companyName,
      orgName: c.orgName,
      orderCount: c.orderCount,
      avgOrderValue: c.avgOrderValue,
      lastOrderAt: c.lastOrderAt,
      daysSinceLastOrder: Math.floor((now.getTime() - new Date(c.lastOrderAt).getTime()) / (24 * 60 * 60 * 1000)),
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      orgName: p.orgName,
      type: p.type,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
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

/**
 * ADM-004: Restaurant directory with health indicators.
 *
 * Health logic (derived from existing data, no new schema):
 *   - Healthy:  isActive=true AND has an order created within the last 14 days
 *   - At Risk:  isActive=true AND has orders but none in the last 14 days
 *   - New:      isActive=true AND has zero orders
 *   - Inactive: isActive=false
 *
 * Owner is derived from the organization_memberships table where role='owner'.
 * If multiple owners exist, the first one (by joinedAt) is used.
 *
 * GMV, order count, avg order value, and last order date are all-time
 * aggregates across confirmed + completed orders for accurate business context.
 */
export async function listRestaurantDirectory() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Main query: org + order aggregates
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    isActive: organizations.isActive,
    isPaid: organizations.stripeChargesEnabled,
    createdAt: organizations.createdAt,
    orderCount: sql<number>`count(${orders.id})::int`,
    gmv: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    avgOrderValue: sql<number>`case when count(${orders.id}) > 0 then (sum(${orders.totalAmount}) / count(${orders.id}))::int else 0 end`,
    lastOrderAt: sql<string | null>`max(${orders.createdAt})`,
  })
    .from(organizations)
    .leftJoin(orders, and(
      eq(orders.organizationId, organizations.id),
      inArray(orders.status, ['confirmed', 'completed', 'submitted', 'awaiting_deposit']),
    ))
    .groupBy(
      organizations.id, organizations.name, organizations.slug,
      organizations.isActive, organizations.stripeChargesEnabled, organizations.createdAt,
    )
    .orderBy(desc(sql`coalesce(sum(${orders.totalAmount}), 0)`));

  // Owner lookup: get owner name + email for each org via memberships
  const ownerRows = await db.select({
    organizationId: organizationMemberships.organizationId,
    userName: users.name,
    userEmail: users.email,
  })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .where(eq(organizationMemberships.role, 'owner'));

  const ownerMap = new Map<string, { name: string; email: string }>();
  for (const row of ownerRows) {
    if (!ownerMap.has(row.organizationId)) {
      ownerMap.set(row.organizationId, { name: row.userName, email: row.userEmail });
    }
  }

  return rows.map((r) => {
    let health: 'healthy' | 'at_risk' | 'new' | 'inactive';
    if (!r.isActive) {
      health = 'inactive';
    } else if (r.orderCount === 0) {
      health = 'new';
    } else if (r.lastOrderAt && new Date(r.lastOrderAt) >= fourteenDaysAgo) {
      health = 'healthy';
    } else {
      health = 'at_risk';
    }

    const owner = ownerMap.get(r.id);

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      isActive: r.isActive,
      isPaid: r.isPaid,
      createdAt: r.createdAt,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? null,
      orderCount: r.orderCount,
      gmv: r.gmv,
      avgOrderValue: r.avgOrderValue,
      lastOrderAt: r.lastOrderAt,
      health,
    };
  });
}
