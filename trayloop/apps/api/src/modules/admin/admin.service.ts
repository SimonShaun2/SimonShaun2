import { db } from '@trayloop/database';
import { customers, deposits, orders, organizationMemberships, organizations, payments, recurringOrders, users } from '@trayloop/database';
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm';

const FINAL_ORDER_STATUSES = ['confirmed', 'completed'] as const;
const PLAN_PRICE_CENTS = 9900;

type CustomerOrderActivityRow = {
  customerId: string;
  customerEmail: string;
  orgName: string;
  totalAmount: number;
  createdAt: Date;
};

function daysBetween(now: Date, then: Date) {
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function displayNameFromEmail(email: string) {
  const localPart = email.split('@')[0] ?? email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

async function getFinalizedCustomerOrderActivity() {
  return db
    .select({
      customerId: customers.id,
      customerEmail: customers.email,
      orgName: organizations.name,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .where(inArray(orders.status, FINAL_ORDER_STATUSES))
    .orderBy(desc(orders.createdAt)) as Promise<CustomerOrderActivityRow[]>;
}

function buildAtRiskCustomers(rows: CustomerOrderActivityRow[], now: Date, fourteenDaysAgo: Date) {
  const grouped = new Map<
    string,
    {
      customerEmail: string;
      orgName: string;
      orderCount: number;
      totalSpend: number;
      lastOrderAt: Date;
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.customerId);
    if (!existing) {
      grouped.set(row.customerId, {
        customerEmail: row.customerEmail,
        orgName: row.orgName,
        orderCount: 1,
        totalSpend: row.totalAmount,
        lastOrderAt: new Date(row.createdAt),
      });
      continue;
    }

    existing.orderCount += 1;
    existing.totalSpend += row.totalAmount;
    if (new Date(row.createdAt) > existing.lastOrderAt) {
      existing.lastOrderAt = new Date(row.createdAt);
    }
  }

  return Array.from(grouped.entries())
    .map(([customerId, customer]) => ({
      customerId,
      name: displayNameFromEmail(customer.customerEmail),
      company: null,
      orgName: customer.orgName,
      orderCount: customer.orderCount,
      avgOrderValue: Math.round(customer.totalSpend / Math.max(1, customer.orderCount)),
      lastOrderAt: customer.lastOrderAt.toISOString(),
      daysSinceLastOrder: daysBetween(now, customer.lastOrderAt),
    }))
    .filter((customer) => customer.orderCount >= 2 && new Date(customer.lastOrderAt) < fourteenDaysAgo)
    .sort((a, b) => b.avgOrderValue - a.avgOrderValue);
}

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

  const activeRestaurants = activeOrgsResult[0]?.count ?? 0;
  const paidRestaurants = paidOrgsResult[0]?.count ?? 0;
  const trialRestaurants = activeRestaurants - paidRestaurants;
  const mrr = paidRestaurants * PLAN_PRICE_CENTS;
  const gmvThisMonth = gmvResult[0]?.total ?? 0;
  const projectedMrr = activeRestaurants * PLAN_PRICE_CENTS;

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
    mrr: restaurant.isPaid ? PLAN_PRICE_CENTS : 0,
    label: restaurant.isPaid ? '$99/mo' : '$0 -> $99',
  }));

  const customerOrderRows = await getFinalizedCustomerOrderActivity();
  const atRiskCustomers = buildAtRiskCustomers(customerOrderRows, now, fourteenDaysAgo);

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
      name: customer.name,
      company: customer.company,
      orgName: customer.orgName,
      orderCount: customer.orderCount,
      avgOrderValue: customer.avgOrderValue,
      lastOrderAt: customer.lastOrderAt,
      daysSinceLastOrder: customer.daysSinceLastOrder,
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
 * ADM-005 Part A: Trial conversion intelligence.
 *
 * Trial restaurants = active orgs where stripeChargesEnabled is false.
 * No explicit trial-end date exists in the schema, so we use a 30-day
 * window from org creation as a soft trial period. "Days remaining" is
 * max(0, 30 - daysSinceCreation). This is a documented approximation.
 *
 * Conversion heat is derived from order activity during the trial window:
 *   - hot:  3+ orders placed
 *   - warm: 1-2 orders placed
 *   - cold: 0 orders placed
 */
export async function getTrialConversions() {
  const now = new Date();
  const TRIAL_DAYS = 30;
  const trialWindow = sql`interval '30 days'`;
  const finalOrderStatuses = sql`('confirmed', 'completed')`;

  // All trial orgs: active but not stripeChargesEnabled
  const trialOrgs = await db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    createdAt: organizations.createdAt,
    orderCount: sql<number>`count(
      case
        when ${orders.status} in ${finalOrderStatuses}
         and ${orders.createdAt} >= ${organizations.createdAt}
         and ${orders.createdAt} < ${organizations.createdAt} + ${trialWindow}
        then 1
      end
    )::int`,
    gmv: sql<number>`coalesce(sum(
      case
        when ${orders.status} in ${finalOrderStatuses}
         and ${orders.createdAt} >= ${organizations.createdAt}
         and ${orders.createdAt} < ${organizations.createdAt} + ${trialWindow}
        then ${orders.totalAmount}
        else 0
      end
    ), 0)::int`,
    lastOrderAt: sql<string | null>`max(${orders.createdAt})`,
  })
    .from(organizations)
    .leftJoin(orders, eq(orders.organizationId, organizations.id))
    .where(and(
      eq(organizations.isActive, true),
      eq(organizations.stripeChargesEnabled, false),
    ))
    .groupBy(organizations.id, organizations.name, organizations.slug, organizations.createdAt)
    .orderBy(desc(sql`count(${orders.id})`));

  // Owner lookup
  const ownerRows = await db.select({
    organizationId: organizationMemberships.organizationId,
    userName: users.name,
  })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .where(eq(organizationMemberships.role, 'owner'));

  const ownerMap = new Map<string, string>();
  for (const row of ownerRows) {
    if (!ownerMap.has(row.organizationId)) ownerMap.set(row.organizationId, row.userName);
  }

  const restaurants = trialOrgs.map((r) => {
    const daysSinceCreation = Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / (86400000));
    const daysRemaining = Math.max(0, TRIAL_DAYS - daysSinceCreation);
    let heat: 'hot' | 'warm' | 'cold';
    if (r.orderCount >= 3) heat = 'hot';
    else if (r.orderCount >= 1) heat = 'warm';
    else heat = 'cold';

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      ownerName: ownerMap.get(r.id) ?? null,
      orderCount: r.orderCount,
      gmv: r.gmv,
      lastOrderAt: r.lastOrderAt,
      daysRemaining,
      daysSinceCreation,
      heat,
    };
  });

  const totalOrders = restaurants.reduce((s, r) => s + r.orderCount, 0);

  return {
    summary: {
      activeTrials: restaurants.length,
      projectedMrr: restaurants.length * PLAN_PRICE_CENTS,
      avgTrialOrders: restaurants.length > 0 ? Math.round(totalOrders / restaurants.length) : 0,
    },
    restaurants,
  };
}

/**
 * ADM-005 Part B: MRR movement.
 *
 * Since no subscription/billing table exists, MRR is modeled as:
 *   - Paid: active orgs with stripeChargesEnabled = true → $99/mo each
 *   - Trial: active orgs with stripeChargesEnabled = false → $0 (pending)
 *   - Inactive: orgs with isActive = false → churned (lost $99/mo)
 *
 * Movement is approximated from org creation date and isActive/updatedAt status:
 *   - "New MRR" = paid orgs created this month × $99
 *   - "Churned MRR" = inactive orgs updated this month that were previously paid × $99
 *     (approximated as inactive orgs with stripeChargesEnabled still true and
 *      updatedAt in the current month, indicating a recent deactivation)
 *
 * These are documented approximations. When a real subscriptions table with
 * start/cancel dates is added, replace this logic.
 */
export async function getMrrMovement() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // All orgs with payment state
  const allOrgs = await db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    isActive: organizations.isActive,
    isPaid: organizations.stripeChargesEnabled,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt,
  }).from(organizations);

  // Owner lookup
  const ownerRows = await db.select({
    organizationId: organizationMemberships.organizationId,
    userName: users.name,
  })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .where(eq(organizationMemberships.role, 'owner'));

  const ownerMap = new Map<string, string>();
  for (const row of ownerRows) {
    if (!ownerMap.has(row.organizationId)) ownerMap.set(row.organizationId, row.userName);
  }

  const restaurants = allOrgs.map((r) => {
    let status: 'paid' | 'trial' | 'churned' | 'inactive';
    let mrr = 0;

    if (!r.isActive && r.isPaid) {
      status = 'churned';
      mrr = -PLAN_PRICE_CENTS; // lost revenue
    } else if (!r.isActive) {
      status = 'inactive';
      mrr = 0;
    } else if (r.isPaid) {
      status = 'paid';
      mrr = PLAN_PRICE_CENTS;
    } else {
      status = 'trial';
      mrr = 0;
    }

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      ownerName: ownerMap.get(r.id) ?? null,
      isActive: r.isActive,
      isPaid: r.isPaid,
      status,
      mrr,
      label: status === 'paid' ? '$99/mo'
        : status === 'trial' ? '$0 → $99'
        : status === 'churned' ? '-$99/mo'
        : 'Inactive',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });

  // New MRR: paid orgs created this month
  const newMrr = restaurants
    .filter((r) => r.status === 'paid' && new Date(r.createdAt) >= monthStart)
    .reduce((s) => s + PLAN_PRICE_CENTS, 0);

  // Churned MRR: inactive orgs that were paid
  const churnedMrr = restaurants
    .filter((r) => r.status === 'churned' && new Date(r.updatedAt) >= monthStart)
    .reduce((s) => s + PLAN_PRICE_CENTS, 0);

  const currentMrr = restaurants
    .filter((r) => r.status === 'paid')
    .reduce((s) => s + PLAN_PRICE_CENTS, 0);

  return {
    summary: {
      currentMrr,
      newMrr,
      churnedMrr,
      netChange: newMrr - churnedMrr,
    },
    restaurants: restaurants.sort((a, b) => b.mrr - a.mrr),
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

/**
 * ADM-006 Part A: Platform Health.
 *
 * System health signals derived from actual database state:
 *   - API: always "healthy" if this endpoint responds
 *   - Stripe: "active" if any org has stripeChargesEnabled
 *   - Deposits: "active" if any deposit rows exist in last 30 days
 *   - Order flow: "active" if any orders created in last 7 days
 *
 * Restaurant health reuses the same 14-day threshold from ADM-004.
 */
export async function getPlatformHealth() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  const [restaurantRows, finalizedOrders30d, recentOrders7d, depositStats, stripeOrgs] = await Promise.all([
    listRestaurantDirectory(),
    db
      .select({
        amount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(inArray(orders.status, FINAL_ORDER_STATUSES), gte(orders.createdAt, thirtyDaysAgo))),
    db
      .select({
        id: orders.id,
      })
      .from(orders)
      .where(and(inArray(orders.status, FINAL_ORDER_STATUSES), gte(orders.createdAt, sevenDaysAgo))),
    db.select({ count: sql<number>`count(*)::int` })
      .from(deposits).where(gte(deposits.createdAt, thirtyDaysAgo)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(organizations).where(eq(organizations.stripeChargesEnabled, true)),
  ]);

  const totalOrders30d = finalizedOrders30d.length;
  const totalRevenue30d = finalizedOrders30d.reduce((sum, order) => sum + order.amount, 0);
  const avgOrderValue = totalOrders30d > 0 ? Math.round(totalRevenue30d / totalOrders30d) : 0;
  const latestOrder = [...finalizedOrders30d].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  const lastOrderAt = latestOrder ? new Date(latestOrder.createdAt).toISOString() : null;
  const recentOrderExists = recentOrders7d.length > 0;
  const systems = [
    { name: 'API', status: 'healthy' as const, detail: 'Responding normally' },
    { name: 'Stripe Payments', status: (stripeOrgs[0]?.count ?? 0) > 0 ? 'active' as const : 'not_connected' as const, detail: (stripeOrgs[0]?.count ?? 0) > 0 ? `${stripeOrgs[0].count} connected` : 'No orgs connected' },
    { name: 'Deposit Flow', status: (depositStats[0]?.count ?? 0) > 0 ? 'active' as const : 'inactive' as const, detail: (depositStats[0]?.count ?? 0) > 0 ? `${depositStats[0].count} deposits (30d)` : 'No recent deposits' },
    { name: 'Order Flow', status: recentOrderExists ? 'active' as const : 'inactive' as const, detail: recentOrderExists ? `${recentOrders7d.length} finalized orders (7d)` : 'No recent finalized orders' },
  ];

  const restaurantHealth = restaurantRows.map((r) => {
    const health = !r.isActive
      ? ('inactive' as const)
      : !r.lastOrderAt
        ? ('new' as const)
        : new Date(r.lastOrderAt) >= fourteenDaysAgo
          ? ('healthy' as const)
          : ('at_risk' as const);

    return {
      id: r.id, name: r.name, isActive: r.isActive, isPaid: r.isPaid,
      ordersThisMonth: r.orderCount, avgOrderValue: r.avgOrderValue,
      lastOrderAt: r.lastOrderAt, health,
    };
  });

  return {
    summary: {
      totalOrders30d,
      avgOrderValue,
      lastOrderAt,
      depositsCount30d: depositStats[0]?.count ?? 0,
    },
    systems,
    restaurantHealth,
  };
}

/**
 * ADM-006 Part B: Revenue Forecast.
 *
 * Uses the recurring_orders table if rows exist. Falls back to
 * inferring recurrence from customers with 2+ orders in the last 60 days,
 * treating them as likely recurring with a documented monthly estimate.
 *
 * Projected monthly value = avgOrderValue × estimated frequency/month.
 * Frequency is derived from: orderCount / (daySpan / 30).
 */
export async function getRevenueForecast() {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
  const finalOrderStatuses = sql`('confirmed', 'completed')`;
  const intervalOrdersPerMonth: Record<'weekly' | 'biweekly' | 'monthly' | 'quarterly', number> = {
    weekly: 4,
    biweekly: 2,
    monthly: 1,
    quarterly: 1 / 3,
  };

  // Check real recurring orders first
  const activeRecurring = await db.select({
    id: recurringOrders.id,
    customerId: recurringOrders.customerId,
    organizationId: recurringOrders.organizationId,
    interval: recurringOrders.interval,
    nextOccurrence: recurringOrders.nextOccurrence,
    headCount: recurringOrders.headCount,
  })
    .from(recurringOrders)
    .where(eq(recurringOrders.isActive, true));

  const metricCustomerIds = activeRecurring.length > 0
    ? Array.from(new Set(activeRecurring.map((row) => row.customerId)))
    : null;

  const customerMetricsQuery = db.select({
    customerId: customers.id,
    firstName: customers.firstName,
    lastName: customers.lastName,
    companyName: customers.companyName,
    orgId: customers.organizationId,
    orgName: organizations.name,
    orderCount: sql<number>`count(${orders.id})::int`,
    totalSpend: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    avgOrderValue: sql<number>`(avg(${orders.totalAmount}))::int`,
    firstOrderAt: sql<string>`min(${orders.createdAt})`,
    lastOrderAt: sql<string>`max(${orders.createdAt})`,
  })
    .from(customers)
    .innerJoin(
      orders,
      and(
        eq(orders.customerId, customers.id),
        gte(orders.createdAt, sixtyDaysAgo),
        inArray(orders.status, ['confirmed', 'completed']),
      ),
    )
    .innerJoin(organizations, eq(organizations.id, customers.organizationId))
    .groupBy(customers.id, customers.firstName, customers.lastName, customers.companyName, customers.organizationId, organizations.name);

  const customerMetrics = metricCustomerIds && metricCustomerIds.length > 0
    ? await customerMetricsQuery.where(inArray(customers.id, metricCustomerIds)).orderBy(desc(sql`sum(${orders.totalAmount})`))
    : await customerMetricsQuery.having(sql`count(${orders.id}) >= 2`).orderBy(desc(sql`sum(${orders.totalAmount})`));

  const metricMap = new Map(customerMetrics.map((row) => [row.customerId, row]));

  const recurringCustomers = activeRecurring.length > 0
    ? activeRecurring
        .map((row) => {
          const metrics = metricMap.get(row.customerId);
          if (!metrics) return null;
          const ordersPerMonth = intervalOrdersPerMonth[row.interval];
          const projectedMonthly = Math.round(metrics.avgOrderValue * ordersPerMonth);

          return {
            customerId: row.customerId,
            name: `${metrics.firstName} ${metrics.lastName}`,
            company: metrics.companyName,
            orgName: metrics.orgName,
            orderCount: metrics.orderCount,
            avgOrderValue: metrics.avgOrderValue,
            ordersPerMonth,
            projectedMonthly,
            nextExpectedOrder: (row.nextOccurrence ?? new Date(metrics.lastOrderAt)).toISOString(),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a, b) => b.projectedMonthly - a.projectedMonthly)
    : customerMetrics.map((c) => {
        const firstDate = new Date(c.firstOrderAt);
        const lastDate = new Date(c.lastOrderAt);
        const daySpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / 86400000);
        const ordersPerMonth = Math.round((c.orderCount / daySpan) * 30 * 10) / 10;
        const projectedMonthly = Math.round(c.avgOrderValue * ordersPerMonth);
        const avgInterval = daySpan / Math.max(1, c.orderCount - 1);
        const nextExpected = new Date(lastDate.getTime() + avgInterval * 86400000);

        return {
          customerId: c.customerId,
          name: `${c.firstName} ${c.lastName}`,
          company: c.companyName,
          orgName: c.orgName,
          orderCount: c.orderCount,
          avgOrderValue: c.avgOrderValue,
          ordersPerMonth,
          projectedMonthly,
          nextExpectedOrder: nextExpected.toISOString(),
        };
      });

  const projectedGmv = recurringCustomers.reduce((s, c) => s + c.projectedMonthly, 0);
  const paidOrgs = await db.select({ count: sql<number>`count(*)::int` })
    .from(organizations)
    .where(and(eq(organizations.isActive, true), eq(organizations.stripeChargesEnabled, true)));
  const projectedMrr = (paidOrgs[0]?.count ?? 0) * PLAN_PRICE_CENTS;

  return {
    summary: {
      projectedGmv30d: projectedGmv,
      recurringClients: recurringCustomers.length,
      projectedMrr,
    },
    recurringCustomers,
  };
}

/**
 * ADM-006 Part C: Churn Risk.
 *
 * Restaurant churn risk:
 *   - Active paid org with no orders in 14+ days
 *   - Active trial org with no orders in 14+ days (trial going cold)
 *
 * Customer churn risk:
 *   - Customers with 2+ historical orders whose last order is 14+ days ago
 *
 * MRR at risk = count of at-risk paid restaurants × $99/mo
 */
export async function getChurnRisk() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  const [restaurants, customerOrderRows] = await Promise.all([
    listRestaurantDirectory(),
    getFinalizedCustomerOrderActivity(),
  ]);

  const atRiskRestaurants = restaurants
    .filter((restaurant) => restaurant.isActive && restaurant.lastOrderAt && new Date(restaurant.lastOrderAt) < fourteenDaysAgo)
    .map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      isPaid: restaurant.isPaid,
      ownerName: restaurant.ownerName,
      ordersThisMonth: restaurant.orderCount,
      lastOrderAt: restaurant.lastOrderAt,
      daysSinceLastOrder: restaurant.lastOrderAt ? daysBetween(now, new Date(restaurant.lastOrderAt)) : null,
      risk: restaurant.isPaid ? ('high' as const) : ('medium' as const),
    }));

  const atRiskCustomers = buildAtRiskCustomers(customerOrderRows, now, fourteenDaysAgo);

  const mrrAtRisk = atRiskRestaurants.filter((r) => r.isPaid).length * PLAN_PRICE_CENTS;

  return {
    summary: {
      atRiskRestaurants: atRiskRestaurants.length,
      mrrAtRisk,
      atRiskCustomers: atRiskCustomers.length,
    },
    restaurants: atRiskRestaurants,
    customers: atRiskCustomers,
  };
}

export async function updateOrgStatus(orgId: string, status: string) {
  return { id: orgId, status };
}

export async function updateUserStatus(userId: string, status: string) {
  return { id: userId, status };
}
