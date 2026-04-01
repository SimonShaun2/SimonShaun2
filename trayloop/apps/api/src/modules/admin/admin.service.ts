import { db } from '@trayloop/database';
import { customers, deposits, orders, organizationMemberships, organizations, payments, users } from '@trayloop/database';
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm';

export async function listOrganizations() {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      isActive: organizations.isActive,
      createdAt: organizations.createdAt,
    })
    .from(organizations);
}

export async function listUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function getPlatformStats() {
  const [[orgCount], [userCount], [orderStats]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(organizations),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db
      .select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(total_amount), 0)::int`,
      })
      .from(orders),
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
 *   No subscription or billing table exists in the current schema. MRR is
 *   approximated as: (count of active orgs with stripeChargesEnabled) x $99/mo.
 *   This matches the pricing shown in the master dashboard designs. When a
 *   real subscriptions table is added, replace this calculation.
 *
 * At-risk revenue:
 *   Calculated from customers whose last order across any org was 14+ days ago
 *   but who have meaningful order volume (2+ orders). Their average order
 *   value represents revenue at risk of churn.
 *
 * GMV this month:
 *   Sum of totalAmount for orders with status confirmed or completed created
 *   in the current calendar month.
 */
export async function getPlatformOverview() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeOrgsResult, paidOrgsResult, gmvResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(eq(organizations.isActive, true)),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(and(eq(organizations.isActive, true), eq(organizations.stripeChargesEnabled, true))),

    db
      .select({
        total: sql<number>`coalesce(sum(total_amount), 0)::int`,
      })
      .from(orders)
      .where(and(inArray(orders.status, ['confirmed', 'completed']), gte(orders.createdAt, monthStart))),
  ]);

  const activeRestaurants = activeOrgsResult[0].count;
  const paidRestaurants = paidOrgsResult[0].count;
  const trialRestaurants = activeRestaurants - paidRestaurants;
  const mrr = paidRestaurants * 9900;
  const gmvThisMonth = gmvResult[0].total;
  const projectedMrr = activeRestaurants * 9900;

  const restaurantsByGmv = await db
    .select({
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

  const mrrBreakdown = restaurantsByGmv.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    isPaid: restaurant.isPaid,
    mrr: restaurant.isPaid ? 9900 : 0,
    label: restaurant.isPaid ? '$99/mo' : '$0 -> $99',
  }));

  const atRiskCustomers = await db
    .select({
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
    .groupBy(
      customers.id,
      customers.firstName,
      customers.lastName,
      customers.companyName,
      organizations.name,
    )
    .having(and(sql`count(${orders.id}) >= 2`, sql`max(${orders.createdAt}) < ${fourteenDaysAgo}`))
    .orderBy(desc(sql`avg(${orders.totalAmount})`));

  const atRiskRevenue = atRiskCustomers.reduce((sum, customer) => sum + (customer.avgOrderValue ?? 0), 0);

  const recentPaymentRows = await db
    .select({
      id: payments.id,
      orgName: organizations.name,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      method: payments.method,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      type: sql<string>`'payment'`,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .where(gte(payments.createdAt, sevenDaysAgo))
    .orderBy(desc(payments.createdAt))
    .limit(20);

  const recentDepositRows = await db
    .select({
      id: deposits.id,
      orgName: organizations.name,
      amount: deposits.amount,
      currency: deposits.currency,
      status: deposits.status,
      paidAt: deposits.paidAt,
      createdAt: deposits.createdAt,
      type: sql<string>`'deposit'`,
    })
    .from(deposits)
    .innerJoin(orders, eq(orders.id, deposits.orderId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .where(gte(deposits.createdAt, sevenDaysAgo))
    .orderBy(desc(deposits.createdAt))
    .limit(20);

  const recentPayments = [
    ...recentPaymentRows.map((payment) => ({
      id: payment.id,
      orgName: payment.orgName,
      type: payment.type,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    })),
    ...recentDepositRows.map((deposit) => ({
      id: deposit.id,
      orgName: deposit.orgName,
      type: deposit.type,
      amount: deposit.amount,
      currency: deposit.currency,
      status: deposit.status,
      paidAt: deposit.paidAt,
      createdAt: deposit.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime())
    .slice(0, 20);

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
    restaurantsByGmv: restaurantsByGmv.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      isPaid: restaurant.isPaid,
      orderCount: restaurant.orderCount,
      gmv: restaurant.gmv,
    })),
    mrrBreakdown,
    atRiskCustomers: atRiskCustomers.map((customer) => ({
      customerId: customer.customerId,
      name: `${customer.firstName} ${customer.lastName}`,
      company: customer.companyName,
      orgName: customer.orgName,
      orderCount: customer.orderCount,
      avgOrderValue: customer.avgOrderValue,
      lastOrderAt: customer.lastOrderAt,
      daysSinceLastOrder: Math.floor(
        (now.getTime() - new Date(customer.lastOrderAt).getTime()) / (24 * 60 * 60 * 1000),
      ),
    })),
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      orgName: payment.orgName,
      type: payment.type,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    })),
  };
}

/**
 * ADM-004: Restaurant directory with health indicators.
 *
 * Health logic:
 *   - healthy: active org with any order activity in the last 14 days
 *   - at_risk: active org with older order activity
 *   - new: active org with no order activity yet
 *   - inactive: org marked inactive
 *
 * Monetary aggregates use only confirmed/completed orders so GMV and average
 * order value don't get inflated by submitted or unpaid pipeline orders.
 */
export async function listRestaurantDirectory() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const finalOrderStatuses = sql`('confirmed', 'completed')`;

  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      isActive: organizations.isActive,
      isPaid: organizations.stripeChargesEnabled,
      createdAt: organizations.createdAt,
      totalOrderCount: sql<number>`count(${orders.id})::int`,
      orderCount: sql<number>`count(case when ${orders.status} in ${finalOrderStatuses} then 1 end)::int`,
      gmv: sql<number>`coalesce(sum(case when ${orders.status} in ${finalOrderStatuses} then ${orders.totalAmount} else 0 end), 0)::int`,
      avgOrderValue: sql<number>`case
        when count(case when ${orders.status} in ${finalOrderStatuses} then 1 end) > 0
        then (
          sum(case when ${orders.status} in ${finalOrderStatuses} then ${orders.totalAmount} else 0 end)
          / count(case when ${orders.status} in ${finalOrderStatuses} then 1 end)
        )::int
        else 0
      end`,
      lastOrderAt: sql<string | null>`max(${orders.createdAt})`,
    })
    .from(organizations)
    .leftJoin(orders, eq(orders.organizationId, organizations.id))
    .groupBy(
      organizations.id,
      organizations.name,
      organizations.slug,
      organizations.isActive,
      organizations.stripeChargesEnabled,
      organizations.createdAt,
    )
    .orderBy(desc(sql`coalesce(sum(case when ${orders.status} in ${finalOrderStatuses} then ${orders.totalAmount} else 0 end), 0)`));

  const ownerRows = await db
    .select({
      organizationId: organizationMemberships.organizationId,
      userName: users.name,
      userEmail: users.email,
      joinedAt: organizationMemberships.joinedAt,
      createdAt: organizationMemberships.createdAt,
    })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .where(eq(organizationMemberships.role, 'owner'))
    .orderBy(
      asc(sql`coalesce(${organizationMemberships.joinedAt}, ${organizationMemberships.createdAt})`),
      asc(users.name),
    );

  const ownerMap = new Map<string, { name: string; email: string }>();
  for (const owner of ownerRows) {
    if (!ownerMap.has(owner.organizationId)) {
      ownerMap.set(owner.organizationId, {
        name: owner.userName,
        email: owner.userEmail,
      });
    }
  }

  return rows.map((restaurant) => {
    let health: 'healthy' | 'at_risk' | 'new' | 'inactive';

    if (!restaurant.isActive) {
      health = 'inactive';
    } else if (restaurant.totalOrderCount === 0) {
      health = 'new';
    } else if (restaurant.lastOrderAt && new Date(restaurant.lastOrderAt) >= fourteenDaysAgo) {
      health = 'healthy';
    } else {
      health = 'at_risk';
    }

    const owner = ownerMap.get(restaurant.id);

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      isActive: restaurant.isActive,
      isPaid: restaurant.isPaid,
      createdAt: restaurant.createdAt,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? null,
      orderCount: restaurant.orderCount,
      gmv: restaurant.gmv,
      avgOrderValue: restaurant.avgOrderValue,
      lastOrderAt: restaurant.lastOrderAt,
      health,
    };
  });
}

export async function updateOrgStatus(orgId: string, status: string) {
  return { id: orgId, status };
}

export async function updateUserStatus(userId: string, status: string) {
  return { id: userId, status };
}
