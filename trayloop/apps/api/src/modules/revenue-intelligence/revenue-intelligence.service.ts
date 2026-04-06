import {
  aiCampaignRecipients,
  aiCampaigns,
  customers,
  deposits,
  followUps,
  orderItems,
  orders,
  organizations,
  revenueInsightEvents,
  subscriptions,
  upsellEvents,
} from '@trayloop/database';
import { db } from '@trayloop/database';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { generateRevenueInsights, isOpenAIEnabled } from '../../lib/openai.js';
import type { RevenueInsightEventInput, RevenueRange } from './revenue-intelligence.schema.js';

const FINAL_ORDER_STATUSES = ['confirmed', 'completed'] as const;

type RevenueOrderRow = {
  orderId: string;
  organizationId: string;
  organizationName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  company: string | null;
  createdAt: Date;
  completedAt: Date | null;
  serviceType: string;
  totalAmount: number;
  merchantRevenueCents: number;
  platformFeeCents: number;
  hadDeposit: boolean;
  depositPaid: boolean;
};

type FollowUpRow = {
  orderId: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
};

type CampaignTouchRow = {
  organizationId: string;
  customerId: string;
  createdAt: Date;
};

type UpsellEventRow = {
  organizationId: string;
  eventType: string;
  revenueCents: number | null;
  createdAt: Date;
};

type CustomerProfile = {
  customerId: string;
  name: string;
  email: string;
  company: string | null;
  orderCount: number;
  totalRevenueCents: number;
  revenueInRangeCents: number;
  avgOrderValueCents: number;
  lastOrderAt: string;
  daysSinceLastOrder: number;
  segment: 'healthy' | 'at_risk' | 'dormant' | 'growth_opportunity';
  score: number;
};

type Opportunity = {
  id: string;
  type: string;
  title: string;
  description: string;
  estimatedRevenueCents: number;
  action: {
    label: string;
    href: string;
  };
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type TrendPoint = {
  date: string;
  totalRevenueCents: number;
  repeatRevenueCents: number;
  newRevenueCents: number;
  orderCount: number;
  avgOrderValueCents: number;
};

type UsageSummary = {
  shown: number;
  clicked: number;
  actioned: number;
};

type RevenueReport = {
  range: RevenueRange;
  rangeLabel: string;
  summary: {
    totalRevenueCents: number;
    platformFeeRevenueCents: number;
    customerPaidCents: number;
    repeatRevenueCents: number;
    newRevenueCents: number;
    repeatRevenueSharePercent: number;
    repeatOrderRatePercent: number;
    avgOrderValueCents: number;
    orderCount: number;
    repeatCustomerCount: number;
    totalCustomerCount: number;
    depositConversionRatePercent: number;
    dormantRevenueCents: number;
    topCustomerConcentration: {
      top1Percent: number;
      top3Percent: number;
      top5Percent: number;
    };
    upsellRevenueCents: number;
    upsellAttachRatePercent: number;
  };
  insights: Array<{
    id: string;
    text: string;
  }>;
  recommendations: Recommendation[];
  opportunities: Opportunity[];
  trends: TrendPoint[];
  topCustomers: CustomerProfile[];
  customerHealth: CustomerProfile[];
  usage: UsageSummary;
};

type PlatformOrganizationSnapshot = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscriptionStatus: string | null;
};

function roundPercent(value: number) {
  return Math.max(0, Math.round(value));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(now: Date, then: Date) {
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86400000));
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getRangeWindow(range: RevenueRange, now = new Date()) {
  const today = startOfDay(now);

  if (range === '7d') {
    const start = new Date(today.getTime() - 6 * 86400000);
    return { start, end: now, label: 'Last 7 days' };
  }

  if (range === 'mtd') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now, label: 'Month to date' };
  }

  if (range === 'prev_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end, label: 'Previous month' };
  }

  const start = new Date(today.getTime() - 29 * 86400000);
  return { start, end: now, label: 'Last 30 days' };
}

async function getOrderRowsForOrganizations(orgIds: string[]): Promise<RevenueOrderRow[]> {
  if (orgIds.length === 0) {
    return [];
  }

  return db
    .select({
      orderId: orders.id,
      organizationId: orders.organizationId,
      organizationName: organizations.name,
      customerId: customers.id,
      customerName: sql<string>`trim(concat(${customers.firstName}, ' ', ${customers.lastName}))`,
      customerEmail: customers.email,
      company: customers.companyName,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      serviceType: orders.serviceType,
      totalAmount: orders.totalAmount,
      merchantRevenueCents: sql<number>`coalesce(sum(${orderItems.totalPrice}), round(${orders.totalAmount} / 1.05))::int`,
      platformFeeCents: sql<number>`greatest(${orders.totalAmount} - coalesce(sum(${orderItems.totalPrice}), round(${orders.totalAmount} / 1.05)), 0)::int`,
      hadDeposit: sql<boolean>`coalesce(bool_or(${deposits.id} is not null), false)`,
      depositPaid: sql<boolean>`coalesce(bool_or(${deposits.status} = 'paid'), false)`,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(deposits, eq(deposits.orderId, orders.id))
    .where(and(inArray(orders.organizationId, orgIds), inArray(orders.status, [...FINAL_ORDER_STATUSES])))
    .groupBy(
      orders.id,
      orders.organizationId,
      organizations.name,
      customers.id,
      customers.firstName,
      customers.lastName,
      customers.email,
      customers.companyName,
      orders.createdAt,
      orders.completedAt,
      orders.serviceType,
      orders.totalAmount,
    )
    .orderBy(desc(orders.createdAt)) as Promise<RevenueOrderRow[]>;
}

async function getFollowUpRows(orgIds: string[]): Promise<FollowUpRow[]> {
  if (orgIds.length === 0) {
    return [];
  }

  return db
    .select({
      orderId: followUps.orderId,
      status: followUps.status,
      createdAt: followUps.createdAt,
      completedAt: followUps.completedAt,
    })
    .from(followUps)
    .where(inArray(followUps.organizationId, orgIds)) as Promise<FollowUpRow[]>;
}

async function getCampaignTouchRows(orgIds: string[]): Promise<CampaignTouchRow[]> {
  if (orgIds.length === 0) {
    return [];
  }

  return db
    .select({
      organizationId: aiCampaigns.organizationId,
      customerId: aiCampaignRecipients.customerId,
      createdAt: aiCampaigns.createdAt,
    })
    .from(aiCampaignRecipients)
    .innerJoin(aiCampaigns, eq(aiCampaigns.id, aiCampaignRecipients.campaignId))
    .where(and(inArray(aiCampaigns.organizationId, orgIds), inArray(aiCampaigns.status, ['sent', 'copied'])))
    .orderBy(desc(aiCampaigns.createdAt)) as Promise<CampaignTouchRow[]>;
}

async function getUpsellEventRows(orgIds: string[]): Promise<UpsellEventRow[]> {
  if (orgIds.length === 0) {
    return [];
  }

  return db
    .select({
      organizationId: upsellEvents.organizationId,
      eventType: upsellEvents.eventType,
      revenueCents: upsellEvents.revenueCents,
      createdAt: upsellEvents.createdAt,
    })
    .from(upsellEvents)
    .where(inArray(upsellEvents.organizationId, orgIds)) as Promise<UpsellEventRow[]>;
}

async function getUsageSummary(orgId: string, start: Date): Promise<UsageSummary> {
  const [summary] = await db
    .select({
      shown: sql<number>`count(case when ${revenueInsightEvents.eventType} = 'shown' then 1 end)::int`,
      clicked: sql<number>`count(case when ${revenueInsightEvents.eventType} = 'clicked' then 1 end)::int`,
      actioned: sql<number>`count(case when ${revenueInsightEvents.eventType} = 'actioned' then 1 end)::int`,
    })
    .from(revenueInsightEvents)
    .where(and(eq(revenueInsightEvents.organizationId, orgId), gte(revenueInsightEvents.createdAt, start)));

  return {
    shown: summary?.shown ?? 0,
    clicked: summary?.clicked ?? 0,
    actioned: summary?.actioned ?? 0,
  };
}

function buildCustomerProfiles(
  now: Date,
  allOrders: RevenueOrderRow[],
  rangeOrders: RevenueOrderRow[],
) {
  const revenueByCustomerInRange = new Map<string, number>();
  for (const order of rangeOrders) {
    revenueByCustomerInRange.set(
      order.customerId,
      (revenueByCustomerInRange.get(order.customerId) ?? 0) + order.merchantRevenueCents,
    );
  }

  const grouped = new Map<string, CustomerProfile>();

  for (const order of allOrders) {
    const existing = grouped.get(order.customerId);
    const lastOrderAt = order.completedAt ?? order.createdAt;

    if (!existing) {
      grouped.set(order.customerId, {
        customerId: order.customerId,
        name: order.customerName || order.customerEmail,
        email: order.customerEmail,
        company: order.company,
        orderCount: 1,
        totalRevenueCents: order.merchantRevenueCents,
        revenueInRangeCents: revenueByCustomerInRange.get(order.customerId) ?? 0,
        avgOrderValueCents: order.merchantRevenueCents,
        lastOrderAt: lastOrderAt.toISOString(),
        daysSinceLastOrder: daysBetween(now, lastOrderAt),
        segment: 'healthy',
        score: 0,
      });
      continue;
    }

    existing.orderCount += 1;
    existing.totalRevenueCents += order.merchantRevenueCents;
    existing.avgOrderValueCents = Math.round(existing.totalRevenueCents / existing.orderCount);
    if (new Date(existing.lastOrderAt) < lastOrderAt) {
      existing.lastOrderAt = lastOrderAt.toISOString();
      existing.daysSinceLastOrder = daysBetween(now, lastOrderAt);
    }
  }

  return Array.from(grouped.values()).map((customer) => {
    let segment: CustomerProfile['segment'] = 'healthy';
    if (customer.daysSinceLastOrder >= 30) {
      segment = 'dormant';
    } else if (customer.daysSinceLastOrder >= 14) {
      segment = 'at_risk';
    } else if (customer.orderCount >= 3 && customer.avgOrderValueCents >= 20000) {
      segment = 'growth_opportunity';
    }

    const recencyScore = customer.daysSinceLastOrder < 14 ? 30 : customer.daysSinceLastOrder < 30 ? 18 : 5;
    const frequencyScore = Math.min(35, customer.orderCount * 7);
    const spendScore = Math.min(35, Math.round(customer.avgOrderValueCents / 2000));

    return {
      ...customer,
      segment,
      score: recencyScore + frequencyScore + spendScore,
    };
  });
}

function buildTrendSeries(
  rangeOrders: RevenueOrderRow[],
  range: { start: Date; end: Date },
  customerProfiles: CustomerProfile[],
) {
  const buckets = new Map<string, { totalRevenueCents: number; repeatRevenueCents: number; newRevenueCents: number; orderCount: number }>();
  const cursor = startOfDay(range.start);
  const end = startOfDay(range.end);

  while (cursor <= end) {
    buckets.set(formatDateKey(cursor), {
      totalRevenueCents: 0,
      repeatRevenueCents: 0,
      newRevenueCents: 0,
      orderCount: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const customerProfileMap = new Map(customerProfiles.map((profile) => [profile.customerId, profile]));

  for (const order of rangeOrders) {
    const key = formatDateKey(startOfDay(order.createdAt));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.totalRevenueCents += order.merchantRevenueCents;
    bucket.orderCount += 1;
    if ((customerProfileMap.get(order.customerId)?.orderCount ?? 0) > 1) {
      bucket.repeatRevenueCents += order.merchantRevenueCents;
    } else {
      bucket.newRevenueCents += order.merchantRevenueCents;
    }
  }

  return Array.from(buckets.entries()).map(([date, bucket]) => ({
    date,
    totalRevenueCents: bucket.totalRevenueCents,
    repeatRevenueCents: bucket.repeatRevenueCents,
    newRevenueCents: bucket.newRevenueCents,
    orderCount: bucket.orderCount,
    avgOrderValueCents: bucket.orderCount > 0 ? Math.round(bucket.totalRevenueCents / bucket.orderCount) : 0,
  }));
}

function buildFallbackInsights(report: RevenueReport) {
  const insights: string[] = [];
  const repeatShare = report.summary.repeatRevenueSharePercent;
  const top3Share = report.summary.topCustomerConcentration.top3Percent;

  if (report.summary.totalRevenueCents === 0) {
    insights.push('No finalized catering revenue landed in this period yet. Focus on getting the first confirmed orders across the line.');
  } else {
    insights.push(`You brought in ${formatCurrency(report.summary.totalRevenueCents)} in catering revenue during ${report.rangeLabel.toLowerCase()}.`);
  }

  insights.push(
    repeatShare >= 50
      ? `${repeatShare}% of your revenue came from repeat customers, which is a strong retention signal.`
      : `Only ${repeatShare}% of revenue came from repeat customers, so there is room to improve retained catering demand.`,
  );

  if (top3Share >= 45) {
    insights.push(`${top3Share}% of revenue is concentrated in your top three customers, so losing one account would hurt materially.`);
  } else {
    insights.push(`Your top three customers make up ${top3Share}% of revenue, which keeps concentration risk manageable right now.`);
  }

  if (report.summary.upsellAttachRatePercent > 0) {
    insights.push(`Upsells added ${formatCurrency(report.summary.upsellRevenueCents)} with a ${report.summary.upsellAttachRatePercent}% attach rate in this window.`);
  }

  if (report.opportunities.length > 0) {
    insights.push(report.opportunities[0]!.description);
  }

  return insights.slice(0, 4).map((text, index) => ({ id: `fallback-${index + 1}`, text }));
}

async function enrichInsightsWithAI(report: RevenueReport) {
  if (!isOpenAIEnabled()) {
    return buildFallbackInsights(report);
  }

  try {
    const generated = await generateRevenueInsights({
      rangeLabel: report.rangeLabel,
      totalRevenueCents: report.summary.totalRevenueCents,
      repeatRevenueSharePercent: report.summary.repeatRevenueSharePercent,
      avgOrderValueCents: report.summary.avgOrderValueCents,
      repeatCustomerCount: report.summary.repeatCustomerCount,
      totalCustomerCount: report.summary.totalCustomerCount,
      dormantRevenueCents: report.summary.dormantRevenueCents,
      topCustomerConcentrationPercent: report.summary.topCustomerConcentration.top3Percent,
      upsellRevenueCents: report.summary.upsellRevenueCents,
      upsellAttachRatePercent: report.summary.upsellAttachRatePercent,
      opportunities: report.opportunities.slice(0, 4).map((opportunity) => ({
        title: opportunity.title,
        description: opportunity.description,
        estimatedRevenueCents: opportunity.estimatedRevenueCents,
      })),
    });

    return generated.map((text, index) => ({ id: `ai-${index + 1}`, text }));
  } catch {
    return buildFallbackInsights(report);
  }
}

function buildReportFromRows(
  rangeKey: RevenueRange,
  range: { start: Date; end: Date; label: string },
  allOrders: RevenueOrderRow[],
  followUpRows: FollowUpRow[],
  campaignRows: CampaignTouchRow[],
  upsellRows: UpsellEventRow[],
  usage: UsageSummary,
): RevenueReport {
  const now = new Date();
  const rangeOrders = allOrders.filter((order) => order.createdAt >= range.start && order.createdAt <= range.end);
  const customerProfiles = buildCustomerProfiles(now, allOrders, rangeOrders);
  const customerProfileMap = new Map(customerProfiles.map((profile) => [profile.customerId, profile]));

  const totalRevenueCents = rangeOrders.reduce((sum, order) => sum + order.merchantRevenueCents, 0);
  const platformFeeRevenueCents = rangeOrders.reduce((sum, order) => sum + order.platformFeeCents, 0);
  const customerPaidCents = rangeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const orderCount = rangeOrders.length;
  const repeatOrders = rangeOrders.filter((order) => (customerProfileMap.get(order.customerId)?.orderCount ?? 0) > 1);
  const repeatRevenueCents = repeatOrders.reduce((sum, order) => sum + order.merchantRevenueCents, 0);
  const newRevenueCents = Math.max(0, totalRevenueCents - repeatRevenueCents);
  const repeatCustomerCount = customerProfiles.filter((customer) => customer.orderCount > 1).length;
  const totalCustomerCount = customerProfiles.length;
  const avgOrderValueCents = orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0;

  const depositOrders = rangeOrders.filter((order) => order.hadDeposit);
  const paidDeposits = depositOrders.filter((order) => order.depositPaid);
  const depositConversionRatePercent = depositOrders.length > 0
    ? roundPercent((paidDeposits.length / depositOrders.length) * 100)
    : 0;

  const dormantCustomers = customerProfiles.filter((customer) => customer.segment === 'dormant');
  const atRiskCustomers = customerProfiles.filter((customer) => customer.segment === 'at_risk');
  const dormantRevenueCents = dormantCustomers.reduce((sum, customer) => sum + customer.avgOrderValueCents, 0);

  const revenueByCustomer = [...customerProfiles]
    .map((customer) => ({
      customerId: customer.customerId,
      revenue: customer.revenueInRangeCents,
    }))
    .filter((entry) => entry.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const topShare = (count: number) => {
    if (totalRevenueCents <= 0) return 0;
    return roundPercent(
      (revenueByCustomer.slice(0, count).reduce((sum, customer) => sum + customer.revenue, 0) / totalRevenueCents) * 100,
    );
  };

  const recentFollowUpOrderIds = new Set(
    followUpRows
      .filter((row) => row.createdAt >= range.start || (row.completedAt && row.completedAt >= range.start))
      .map((row) => row.orderId),
  );
  const recentCampaignCustomerIds = new Set(
    campaignRows
      .filter((row) => row.createdAt >= range.start)
      .map((row) => row.customerId),
  );

  const recentLargeOrdersWithoutFollowUp = rangeOrders
    .filter((order) => order.createdAt >= new Date(now.getTime() - 14 * 86400000))
    .filter((order) => order.merchantRevenueCents >= Math.max(30000, Math.round(avgOrderValueCents * 1.25)))
    .filter((order) => !recentFollowUpOrderIds.has(order.orderId) && !recentCampaignCustomerIds.has(order.customerId))
    .sort((a, b) => b.merchantRevenueCents - a.merchantRevenueCents);

  const rangeUpsellEvents = upsellRows.filter((row) => row.createdAt >= range.start && row.createdAt <= range.end);
  const upsellShown = rangeUpsellEvents.filter((row) => row.eventType === 'shown').length;
  const upsellAccepted = rangeUpsellEvents.filter((row) => row.eventType === 'accepted').length;
  const upsellRevenueCents = rangeUpsellEvents
    .filter((row) => row.eventType === 'accepted')
    .reduce((sum, row) => sum + (row.revenueCents ?? 0), 0);
  const upsellAttachRatePercent = upsellShown > 0 ? roundPercent((upsellAccepted / upsellShown) * 100) : 0;

  const opportunities: Opportunity[] = [];

  if (dormantCustomers.length > 0) {
    opportunities.push({
      id: 'dormant-repeat-customers',
      type: 'reactivation',
      title: `${dormantCustomers.length} dormant repeat customers are recoverable`,
      description: `Dormant accounts still represent about ${formatCurrency(dormantRevenueCents)} in recoverable average order value. The highest-value ones have already ordered before and are worth reactivating now.`,
      estimatedRevenueCents: dormantRevenueCents,
      action: {
        label: 'Send dormant campaign',
        href: '/?builder=1&segment=dormant&kind=reactivation',
      },
    });
  }

  if (atRiskCustomers.length > 0) {
    const atRiskRevenueCents = atRiskCustomers.reduce((sum, customer) => sum + customer.avgOrderValueCents, 0);
    opportunities.push({
      id: 'at-risk-repeat-customers',
      type: 'reorder',
      title: `${atRiskCustomers.length} repeat customers are slipping`,
      description: `At-risk repeat accounts represent ${formatCurrency(atRiskRevenueCents)} in reachable average order value before they go cold.`,
      estimatedRevenueCents: atRiskRevenueCents,
      action: {
        label: 'Reach back out',
        href: '/?builder=1&segment=at_risk&kind=reactivation',
      },
    });
  }

  if (recentLargeOrdersWithoutFollowUp.length > 0) {
    const topOrder = recentLargeOrdersWithoutFollowUp[0]!;
    opportunities.push({
      id: `large-order-${topOrder.orderId}`,
      type: 'follow_up',
      title: 'A recent large order still has no follow-up',
      description: `${topOrder.customerName || topOrder.customerEmail} placed a ${formatCurrency(topOrder.merchantRevenueCents)} order recently and has not been touched again yet.`,
      estimatedRevenueCents: topOrder.merchantRevenueCents,
      action: {
        label: 'Send reorder reminder',
        href: `/?builder=1&segment=all&kind=reorder_reminder&customerId=${topOrder.customerId}`,
      },
    });
  }

  if (topShare(3) >= 45) {
    opportunities.push({
      id: 'customer-concentration-risk',
      type: 'concentration',
      title: 'Revenue is concentrated in a few accounts',
      description: `${topShare(3)}% of revenue in this period came from your top three customers. That concentration makes retention and account expansion more important.`,
      estimatedRevenueCents: Math.round(totalRevenueCents * (topShare(3) / 100)),
      action: {
        label: 'Review top accounts',
        href: '/revenue-intelligence',
      },
    });
  }

  if (upsellShown > 0 && upsellAttachRatePercent < 20) {
    const estimatedUpsellLift = Math.round(totalRevenueCents * 0.03);
    opportunities.push({
      id: 'upsell-attach-gap',
      type: 'upsell',
      title: 'Upsell attach rate is still light',
      description: `Only ${upsellAttachRatePercent}% of upsell recommendations converted in this period, leaving room to lift average order value on future checkouts.`,
      estimatedRevenueCents: estimatedUpsellLift,
      action: {
        label: 'Tune upsell catalog',
        href: '/catalog',
      },
    });
  }

  opportunities.sort((a, b) => b.estimatedRevenueCents - a.estimatedRevenueCents);

  const recommendations: Recommendation[] = opportunities.slice(0, 4).map((opportunity) => ({
    id: `rec-${opportunity.id}`,
    title: opportunity.title,
    description: opportunity.description,
    href: opportunity.action.href,
    cta: opportunity.action.label,
  }));

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-open-report',
      title: 'Keep watching the revenue trends',
      description: 'There are no urgent leaks right now. Stay on top of repeat revenue, concentration, and upsell performance from the report.',
      href: '/revenue-intelligence',
      cta: 'Open revenue report',
    });
  }

  const topCustomers = [...customerProfiles]
    .sort((a, b) => (b.revenueInRangeCents || b.totalRevenueCents) - (a.revenueInRangeCents || a.totalRevenueCents))
    .slice(0, 8);

  const customerHealth = [...customerProfiles]
    .sort((a, b) => (b.score - a.score) || (b.totalRevenueCents - a.totalRevenueCents))
    .slice(0, 12);

  return {
    range: rangeKey,
    rangeLabel: range.label,
    summary: {
      totalRevenueCents,
      platformFeeRevenueCents,
      customerPaidCents,
      repeatRevenueCents,
      newRevenueCents,
      repeatRevenueSharePercent: totalRevenueCents > 0 ? roundPercent((repeatRevenueCents / totalRevenueCents) * 100) : 0,
      repeatOrderRatePercent: orderCount > 0 ? roundPercent((repeatOrders.length / orderCount) * 100) : 0,
      avgOrderValueCents,
      orderCount,
      repeatCustomerCount,
      totalCustomerCount,
      depositConversionRatePercent,
      dormantRevenueCents,
      topCustomerConcentration: {
        top1Percent: topShare(1),
        top3Percent: topShare(3),
        top5Percent: topShare(5),
      },
      upsellRevenueCents,
      upsellAttachRatePercent,
    },
    insights: [],
    recommendations,
    opportunities: opportunities.slice(0, 6),
    trends: buildTrendSeries(rangeOrders, range, customerProfiles),
    topCustomers,
    customerHealth,
    usage,
  };
}

async function buildMerchantReport(organizationId: string, rangeKey: RevenueRange): Promise<RevenueReport> {
  const range = getRangeWindow(rangeKey);
  const [ordersForOrg, followUpRows, campaignRows, upsellRows, usage] = await Promise.all([
    getOrderRowsForOrganizations([organizationId]),
    getFollowUpRows([organizationId]),
    getCampaignTouchRows([organizationId]),
    getUpsellEventRows([organizationId]),
    getUsageSummary(organizationId, range.start),
  ]);

  const report = buildReportFromRows(rangeKey, range, ordersForOrg, followUpRows, campaignRows, upsellRows, usage);
  report.insights = await enrichInsightsWithAI(report);
  return report;
}

async function getPlatformOrganizationSnapshots(): Promise<PlatformOrganizationSnapshot[]> {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      isActive: organizations.isActive,
      subscriptionStatus: subscriptions.status,
    })
    .from(organizations)
    .leftJoin(subscriptions, eq(subscriptions.organizationId, organizations.id));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.isActive,
    subscriptionStatus: row.subscriptionStatus ?? null,
  }));
}

export async function getRevenueIntelligenceReport(
  organizationId: string,
  rangeKey: RevenueRange = '30d',
) {
  return buildMerchantReport(organizationId, rangeKey);
}

export async function getRevenueIntelligenceSummary(
  organizationId: string,
  rangeKey: RevenueRange = '30d',
) {
  const report = await buildMerchantReport(organizationId, rangeKey);
  return {
    range: report.range,
    rangeLabel: report.rangeLabel,
    summary: report.summary,
    insights: report.insights,
    recommendations: report.recommendations,
    opportunities: report.opportunities.slice(0, 3),
    topCustomers: report.topCustomers.slice(0, 5),
    customerHealth: report.customerHealth.slice(0, 6),
    trends: report.trends,
    usage: report.usage,
  };
}

export async function getPlatformRevenueIntelligence(rangeKey: RevenueRange = '30d') {
  const range = getRangeWindow(rangeKey);
  const orgSnapshots = await getPlatformOrganizationSnapshots();
  const activeOrgIds = orgSnapshots.filter((org) => org.isActive).map((org) => org.id);

  const [ordersForPlatform, followUpRows, campaignRows, upsellRows] = await Promise.all([
    getOrderRowsForOrganizations(activeOrgIds),
    getFollowUpRows(activeOrgIds),
    getCampaignTouchRows(activeOrgIds),
    getUpsellEventRows(activeOrgIds),
  ]);

  const usage: UsageSummary = { shown: 0, clicked: 0, actioned: 0 };
  const report = buildReportFromRows(rangeKey, range, ordersForPlatform, followUpRows, campaignRows, upsellRows, usage);
  report.insights = await enrichInsightsWithAI(report);

  const orgRows = orgSnapshots.map((org) => {
    const orgOrders = ordersForPlatform.filter((order) => order.organizationId === org.id);
    const totalRevenueCents = orgOrders.reduce((sum, order) => sum + order.merchantRevenueCents, 0);
    const platformFeeRevenueCents = orgOrders.reduce((sum, order) => sum + order.platformFeeCents, 0);
    const orderCount = orgOrders.length;
    const avgOrderValueCents = orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0;
    const repeatCustomers = new Set(
      orgOrders
        .map((order) => order.customerId)
        .filter((customerId) => orgOrders.filter((order) => order.customerId === customerId).length > 1),
    ).size;
    const uniqueCustomers = new Set(orgOrders.map((order) => order.customerId)).size;
    const lastOrder = [...orgOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;

    let health: 'healthy' | 'at_risk' | 'dormant' | 'new' = 'new';
    if (orderCount === 0) {
      health = 'new';
    } else {
      const daysSinceLastOrder = daysBetween(new Date(), lastOrder?.completedAt ?? lastOrder!.createdAt);
      if (daysSinceLastOrder >= 30) {
        health = 'dormant';
      } else if (daysSinceLastOrder >= 14) {
        health = 'at_risk';
      } else {
        health = 'healthy';
      }
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      isActive: org.isActive,
      subscriptionStatus: org.subscriptionStatus,
      totalRevenueCents,
      platformFeeRevenueCents,
      orderCount,
      avgOrderValueCents,
      repeatCustomerCount: repeatCustomers,
      totalCustomerCount: uniqueCustomers,
      lastOrderAt: lastOrder ? (lastOrder.completedAt ?? lastOrder.createdAt).toISOString() : null,
      health,
    };
  });

  const orgHealthCounts = orgRows.reduce(
    (acc, org) => {
      acc[org.health] += 1;
      return acc;
    },
    { healthy: 0, at_risk: 0, dormant: 0, new: 0 },
  );

  return {
    range: report.range,
    rangeLabel: report.rangeLabel,
    summary: {
      ...report.summary,
      activeOrganizations: orgSnapshots.filter((org) => org.isActive).length,
      organizationsWithRevenue: orgRows.filter((org) => org.totalRevenueCents > 0).length,
      orgHealthCounts,
    },
    insights: report.insights,
    recommendations: report.recommendations,
    opportunities: report.opportunities,
    trends: report.trends,
    organizations: orgRows.sort((a, b) => b.totalRevenueCents - a.totalRevenueCents),
    topCustomers: report.topCustomers,
  };
}

export async function trackRevenueInsightEvent(
  organizationId: string,
  userId: string,
  input: RevenueInsightEventInput,
) {
  await db.insert(revenueInsightEvents).values({
    organizationId,
    userId,
    eventType: input.eventType,
    itemType: input.itemType,
    itemKey: input.itemKey,
    page: input.page,
    metadata: input.metadata ?? {},
  });
}
