'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  apiFetch,
  fetchStorefrontContext,
  type MerchantStorefrontContext,
} from '../lib/api';
import SetupChecklist from '../components/setup-checklist';
import { usePlanAccess } from '../components/plan-access-provider';
import { hasMerchantSession } from '../lib/session';
import { useMobile } from '../lib/use-mobile';
import {
  getMerchantPlanDisplay,
  getMerchantPlanPriceLabel,
} from '../lib/plan-copy';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  eventDate: string;
  headCount: number;
  itemCount: number;
  pricing: { total: number; currency: string };
  location: { name: string; city: string } | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  deposit: { status: string; amount: number } | null;
  timestamps: { created: string; updated: string; completed: string | null };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  orderCount: number;
  revenue: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  last7DaysRevenue: number;
  last7DaysOrders: number;
  last30DaysRevenue: number;
  completedOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
  upsellShown: number;
  upsellAccepted: number;
  upsellRevenue: number;
  upsellAttachRate: number;
  dailyRevenue: DailyRevenue[];
  locationBreakdown: LocationBreakdown[];
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; label: string; lane: string }
> = {
  submitted: {
    bg: '#FEF3C7',
    color: '#92400E',
    label: 'New',
    lane: 'Review now',
  },
  awaiting_deposit: {
    bg: '#DBEAFE',
    color: '#1E40AF',
    label: 'Awaiting Deposit',
    lane: 'Needs deposit',
  },
  confirmed: {
    bg: '#DCFCE7',
    color: '#166534',
    label: 'Confirmed',
    lane: 'Ready to serve',
  },
  completed: {
    bg: '#F3F4F6',
    color: '#374151',
    label: 'Completed',
    lane: 'Past orders',
  },
  cancelled: {
    bg: '#FEE2E2',
    color: '#991B1B',
    label: 'Cancelled',
    lane: 'Past orders',
  },
};

const DEPOSIT_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Deposit pending' },
  paid: { bg: '#DCFCE7', color: '#166534', label: 'Paid' },
  refunded: { bg: '#F3F4F6', color: '#6B7280', label: 'Expired' },
};

const FILTERS = [
  { value: '', label: 'All orders' },
  { value: 'submitted', label: 'New' },
  { value: 'awaiting_deposit', label: 'Awaiting Deposit' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay()] || dateStr;
}

function isWithin48Hours(eventDate: string): boolean {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
}

function isUpcoming(eventDate: string): boolean {
  return new Date(eventDate) >= new Date();
}

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

type CopilotInsightKey = 'price_higher' | 'upsell_next' | 'reorder_next' | 'fix_next';

interface CopilotInsight {
  key: CopilotInsightKey;
  label: string;
  title: string;
  summary: string;
  detail: string;
  actionLabel: string;
  href: string;
  stat: string;
}

function buildCopilotInsights({
  stats,
  dueSoonOrders,
  awaitingDepositOrders,
  repeatCustomers,
  unlocked,
  storefrontUrl,
  locationCount,
}: {
  stats: Stats | null;
  dueSoonOrders: Order[];
  awaitingDepositOrders: Order[];
  repeatCustomers: number;
  unlocked: boolean;
  storefrontUrl: string | null;
  locationCount: number;
}): CopilotInsight[] {
  const avgOrderValue = stats?.avgOrderValue ?? null;
  const priceLift = avgOrderValue == null ? 8 : avgOrderValue >= 80000 ? 12 : avgOrderValue >= 50000 ? 10 : 8;
  const reorderCadence =
    repeatCustomers > 12 ? '72 hours after fulfillment' : repeatCustomers > 4 ? '5 days after fulfillment' : '1 week after fulfillment';
  const priceStat = avgOrderValue != null ? money(avgOrderValue) : '---';
  const reorderStat = repeatCustomers > 0 ? `${repeatCustomers} repeat customers` : 'No repeat signal yet';
  const upsellStat =
    stats && stats.upsellShown > 0
      ? `${stats.upsellAccepted} accepted from ${stats.upsellShown} shown`
      : 'No upsell data yet';
  const fixHref = storefrontUrl ? '/launch' : '/settings';

  const insights: CopilotInsight[] = [
    {
      key: 'price_higher',
      label: 'Price higher',
      title: unlocked
        ? avgOrderValue != null
          ? `Test a ${priceLift}% lift on your top package`
          : 'Test a higher price on your strongest offer'
        : 'Unlock pricing guidance',
      summary: unlocked
        ? avgOrderValue != null
          ? `Your average order value is ${priceStat}. Start with the busiest package and hold everything else steady.`
          : 'Once the engine has enough order data, it will point to the strongest package to reprice first.'
        : 'Growth Advisor will calculate the exact price move using live orders, packages, and launch setup.',
      detail: unlocked
        ? avgOrderValue != null
          ? `A measured ${priceLift}% lift gives you room to protect margin without changing the whole catalog at once.`
          : 'Use the live catalog signal to identify the first offer worth testing.'
        : 'Unlock the copilot to see the precise pricing move and the offer to test first.',
      actionLabel: unlocked ? 'Review catalog pricing' : 'Open Growth Advisor',
      href: unlocked ? '/catalog' : '/growth-advisor',
      stat: unlocked ? priceStat : 'Locked',
    },
    {
      key: 'upsell_next',
      label: 'Upsell next',
      title: unlocked
        ? stats?.upsellAttachRate != null
          ? `Push attach rate above ${stats.upsellAttachRate}%`
          : 'Add one stronger upsell at checkout'
        : 'Unlock upsell guidance',
      summary: unlocked
        ? stats?.upsellShown
          ? `You already showed upsells ${stats.upsellShown} times. Add premium sides, beverages, or add-ons where orders already convert.`
          : 'The engine will point to the best bundle and add-on path once it can read order behavior.'
        : 'Growth Advisor will tell you what add-on or bundle should sell next.',
      detail: unlocked
        ? stats?.upsellShown
          ? `${upsellStat}. Route that attention into the highest-margin add-on first.`
          : 'The next unlock is a clean add-on ladder, not more menu noise.'
        : 'Unlock the engine-level view to see the exact upsell move.',
      actionLabel: unlocked ? 'Open customer engine' : 'Open Growth Advisor',
      href: unlocked ? '/customers' : '/growth-advisor',
      stat: unlocked ? upsellStat : 'Locked',
    },
    {
      key: 'reorder_next',
      label: 'Reorder next',
      title: unlocked
        ? repeatCustomers > 0
          ? `Rebook repeat buyers on a ${reorderCadence} cadence`
          : 'Build the reorder loop'
        : 'Unlock reorder guidance',
      summary: unlocked
        ? repeatCustomers > 0
          ? `You have ${repeatCustomers} repeat customers already. Use a timed reminder after fulfillment so the next order arrives before the calendar goes cold.`
          : 'The copilot will define a reorder cadence after it sees the first repeat signal.'
        : 'The copilot will show which customers are ready to reorder next.',
      detail: unlocked
        ? dueSoonOrders.length > 0
          ? `${dueSoonOrders.length} orders are due soon, which is a good moment to plan the next request before delivery closes the loop.`
          : `Use the best current buyers and ask again on a ${reorderCadence} cadence.`
        : 'Unlock the engine to see the reorder timing that matches your live demand.',
      actionLabel: unlocked ? 'Review orders' : 'Open Growth Advisor',
      href: unlocked ? '/orders' : '/growth-advisor',
      stat: unlocked ? reorderStat : 'Locked',
    },
    {
      key: 'fix_next',
      label: 'Fix next',
      title: unlocked
        ? awaitingDepositOrders.length > 0
          ? 'Close deposit follow-up before scaling more demand'
          : locationCount === 0
            ? 'Add a location before pushing traffic'
            : 'Tighten the launch lane'
        : 'Unlock launch fixes',
      summary: unlocked
        ? awaitingDepositOrders.length > 0
          ? `${awaitingDepositOrders.length} orders are waiting on deposits. Clear that blocker first so more traffic does not leak into the gap.`
          : locationCount === 0
            ? 'The storefront still needs a location. Fix the structure before spending on growth.'
            : 'The engine will point to the highest-friction setup step before the next growth move.'
        : 'The copilot will surface the first fix that blocks growth.',
      detail: unlocked
        ? storefrontUrl
          ? 'Keep launch, pricing, and deposit policy aligned before you turn on more demand.'
          : 'A public storefront is still the fastest force multiplier to lock down.'
        : 'Unlock the copilot to see the launch blocker with the biggest payback.',
      actionLabel: unlocked ? 'Open Launch Center' : 'Open Growth Advisor',
      href: fixHref,
      stat: unlocked ? (storefrontUrl ? 'Storefront live' : 'No storefront yet') : 'Locked',
    },
  ];

  return insights;
}

export default function DashboardPage() {
  const isMobile = useMobile();
  const planAccess = usePlanAccess();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [storefrontContext, setStorefrontContext] =
    useState<MerchantStorefrontContext | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!hasMerchantSession()) {
      window.location.href = '/login';
      return;
    }
    void refreshDashboard();
  }, [statusFilter, page]);

  useEffect(() => {
    if (!hasMerchantSession()) {
      return;
    }
    fetchStorefrontContext()
      .then((context) => setStorefrontContext(context))
      .catch(() => {});
  }, []);

  async function fetchStats() {
    try {
      const res = await apiFetch('/api/orders/stats');
      setStats(res.data);
    } catch {
      /* non-critical */
    }
  }

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('pageSize', '20');
      const res = await apiFetch(`/api/orders?${params}`);
      setOrders(res.data);
      setPagination(res.meta);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function refreshDashboard() {
    await Promise.all([fetchOrders(), fetchStats()]);
  }

  const filteredOrders = useMemo(() => {
    if (!locationFilter) return orders;
    return orders.filter((o) => o.location?.name === locationFilter);
  }, [orders, locationFilter]);

  const { upcomingOrders, pastOrders } = useMemo(() => {
    const upcoming: Order[] = [];
    const past: Order[] = [];

    for (const order of filteredOrders) {
      if (isUpcoming(order.eventDate)) {
        upcoming.push(order);
      } else {
        past.push(order);
      }
    }

    return { upcomingOrders: upcoming, pastOrders: past };
  }, [filteredOrders]);

  const dueSoonOrders = useMemo(
    () => upcomingOrders.filter((order) => isWithin48Hours(order.eventDate)),
    [upcomingOrders],
  );

  const newOrders = useMemo(
    () => filteredOrders.filter((order) => order.status === 'submitted'),
    [filteredOrders],
  );

  const awaitingDepositOrders = useMemo(
    () =>
      filteredOrders.filter(
        (order) =>
          order.status === 'awaiting_deposit' ||
          order.deposit?.status === 'pending',
      ),
    [filteredOrders],
  );

  const confirmedOrders = useMemo(
    () => filteredOrders.filter((order) => order.status === 'confirmed'),
    [filteredOrders],
  );

  const topLocation = useMemo(() => {
    if (!stats?.locationBreakdown?.length) return null;
    return [...stats.locationBreakdown].sort((a, b) => b.revenue - a.revenue)[0] ?? null;
  }, [stats?.locationBreakdown]);

  const todayRevenueDelta = useMemo(() => {
    if (!stats) return null;
    return stats.last30DaysRevenue > 0
      ? Math.round((stats.last7DaysRevenue / stats.last30DaysRevenue) * 100)
      : null;
  }, [stats]);

  const currentPlanDisplay = getMerchantPlanDisplay(planAccess.currentPlan);
  const nextPlanDisplay = currentPlanDisplay?.nextPlan
    ? getMerchantPlanDisplay(currentPlanDisplay.nextPlan)
    : null;
  const currentPlanPriceLabel = getMerchantPlanPriceLabel(planAccess.currentPlan);
  const growthAdvisorFeature = planAccess.billing?.features.growthAdvisor;
  const growthAdvisorUnlocked = Boolean(growthAdvisorFeature?.enabled);
  const copilotInsights = useMemo(
    () =>
      buildCopilotInsights({
        stats,
        dueSoonOrders,
        awaitingDepositOrders,
        repeatCustomers: stats?.repeatCustomers ?? 0,
        unlocked: growthAdvisorUnlocked,
        storefrontUrl: storefrontContext?.storefrontUrl ?? null,
        locationCount: storefrontContext?.locations.length ?? 0,
      }),
    [
      stats,
      dueSoonOrders,
      awaitingDepositOrders,
      growthAdvisorUnlocked,
      storefrontContext?.storefrontUrl,
      storefrontContext?.locations.length,
    ],
  );

  const priorityCards = [
    {
      label: 'Review now',
      value: newOrders.length,
      body:
        newOrders.length > 0
          ? `${newOrders.length} new catering requests are waiting for a fast first response.`
          : 'No brand-new orders need attention right now.',
      tone: '#F97316',
      href: '/orders?status=submitted',
    },
    {
      label: 'Due soon',
      value: dueSoonOrders.length,
      body:
        dueSoonOrders.length > 0
          ? `${dueSoonOrders.length} orders land within the next 48 hours.`
          : 'Nothing urgent is approaching in the next 48 hours.',
      tone: '#D4A853',
      href: '/orders',
    },
    {
      label: 'Awaiting deposit',
      value: awaitingDepositOrders.length,
      body:
        awaitingDepositOrders.length > 0
          ? 'Follow up before timing slips and the order cools off.'
          : 'Deposit collection is clear at the moment.',
      tone: '#2563EB',
      href: '/orders?status=awaiting_deposit',
    },
    {
      label: 'Active plan',
      value: currentPlanDisplay?.label ?? 'Plan',
      body: nextPlanDisplay
        ? `${nextPlanDisplay.label} unlocks ${nextPlanDisplay.highlights[0]?.toLowerCase() ?? 'more automation'}.`
        : 'You are already on the highest plan.',
      tone: '#1C1917',
      href: '/billing',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <section
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid #E7E5E4',
          background:
            'linear-gradient(135deg, #1C1917 0%, #292524 48%, #44403C 100%)',
          color: '#FAFAF9',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.5fr) minmax(0, 0.95fr)',
            gap: 18,
            padding: isMobile ? '20px 16px' : '28px 28px 24px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#FCD34D',
                marginBottom: 14,
              }}
            >
              Operator dashboard
            </div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1.05,
                margin: 0,
                maxWidth: 760,
              }}
            >
              What needs attention today, and where the next revenue move lives.
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: 'rgba(250,250,249,0.82)',
                margin: '14px 0 0',
                maxWidth: 760,
              }}
            >
              Run launch, orders, repeat revenue, and follow-up work from one place.
              The layout is tuned for fast scanning so operators can decide quickly and
              move cleanly.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 18,
              }}
            >
              <MissionChip label={currentPlanDisplay?.label ?? 'Plan loading'} value={currentPlanPriceLabel} />
              <MissionChip label="Live orders" value={String(stats?.activeOrders ?? 0)} />
              <MissionChip label="Repeat customers" value={String(stats?.repeatCustomers ?? 0)} />
              <MissionChip
                label="Last refresh"
                value={
                  lastUpdatedAt
                    ? lastUpdatedAt.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Syncing'
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 22,
              }}
            >
              <a href="/orders" style={heroPrimaryButtonStyle}>
                Open order board
              </a>
              <button onClick={() => void refreshDashboard()} style={heroSecondaryButtonStyle}>
                Refresh dashboard
              </button>
              <a
                href={storefrontContext?.storefrontUrl ?? '/launch'}
                target={storefrontContext?.storefrontUrl ? '_blank' : undefined}
                rel="noreferrer"
                style={heroSecondaryButtonStyle}
              >
                {storefrontContext?.storefrontUrl ? 'View storefront' : 'Open Launch Center'}
              </a>
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              padding: 20,
              display: 'grid',
              gap: 14,
              alignContent: 'start',
            }}
          >
            <div>
              <div style={heroEyebrowStyle}>Revenue pulse</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
                {stats ? money(stats.last7DaysRevenue) : '...'}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(250,250,249,0.72)',
                  marginTop: 4,
                }}
              >
                Last 7 days revenue
                {todayRevenueDelta !== null
                  ? ` | ${todayRevenueDelta}% of the 30-day base`
                  : ''}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <MissionMetricRow
                label="Average order value"
                value={stats ? money(stats.avgOrderValue) : '...'}
                detail={
                  stats
                    ? `${stats.last7DaysOrders} orders in the last 7 days`
                    : 'Waiting for orders'
                }
              />
              <MissionMetricRow
                label="Upsell lift"
                value={stats ? money(stats.upsellRevenue) : '...'}
                detail={
                  stats
                    ? `${stats.upsellAttachRate}% attach rate across ${stats.upsellShown} shown`
                    : 'No upsell data yet'
                }
              />
              <MissionMetricRow
                label="Top location"
                value={topLocation ? topLocation.locationName : 'No location data'}
                detail={
                  topLocation
                    ? `${money(topLocation.revenue)} across ${topLocation.orderCount} orders`
                    : 'Revenue will appear here'
                }
              />
            </div>

            {stats?.dailyRevenue?.length ? (
              <div
                style={{
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px 14px 12px',
                }}
              >
                <div style={heroEyebrowStyle}>7-day rhythm</div>
                <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                  {stats.dailyRevenue.slice(-5).map((day) => (
                    <PulseRow
                      key={day.date}
                      day={day}
                      maxRevenue={Math.max(
                        ...stats.dailyRevenue.map((entry) => entry.revenue),
                        1,
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          {priorityCards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              style={{
                textDecoration: 'none',
                color: '#FAFAF9',
                background: 'rgba(0,0,0,0.14)',
                padding: '16px 20px 18px',
                minHeight: 126,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  color: card.tone,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 14,
                }}
              >
                {card.label}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {card.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'rgba(250,250,249,0.76)',
                  marginTop: 10,
                }}
              >
                {card.body}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 2. Operator Board */}
      <section
            style={{
              border: '1px solid #E7E5E4',
              borderRadius: 18,
              background: '#FFFFFF',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={sectionEyebrowStyle}>Operator board</div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#1C1917',
                    margin: '4px 0 6px',
                  }}
                >
                  Triage the day without losing the thread
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: '#57534E',
                    lineHeight: 1.6,
                  }}
                >
                  The lanes below group work by urgency so operators can move from
                  new leads to served orders without scanning the whole table first.
                </p>
              </div>
              <div style={{ fontSize: 12, color: '#78716C' }}>
                {pagination ? `${pagination.total} orders in this view` : 'Order data'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <TriageLane
                title="Review now"
                subtitle="New requests"
                orders={newOrders}
                accent="#F97316"
                empty="No new orders are waiting."
              />
              <TriageLane
                title="Needs deposit"
                subtitle="Money blockers"
                orders={awaitingDepositOrders}
                accent="#2563EB"
                empty="No deposit follow-up is pending."
              />
              <TriageLane
                title="Due soon"
                subtitle="Next 48 hours"
                orders={dueSoonOrders}
                accent="#D4A853"
                empty="Nothing urgent is due soon."
              />
              <TriageLane
                title="Ready to serve"
                subtitle="Confirmed orders"
                orders={confirmedOrders}
                accent="#16A34A"
                empty="No confirmed upcoming orders yet."
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FILTERS.map((filter) => {
                  const active = statusFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setStatusFilter(filter.value);
                        setPage(1);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 999,
                        border: active ? '1px solid #1C1917' : '1px solid #E7E5E4',
                        background: active ? '#1C1917' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#57534E',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {stats?.locationBreakdown?.map((location) => {
                  const active = locationFilter === location.locationName;
                  return (
                    <button
                      key={location.locationId}
                      onClick={() =>
                        setLocationFilter(active ? '' : location.locationName)
                      }
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        border: active ? '1px solid #A16207' : '1px solid #E7E5E4',
                        background: active ? '#FFFBEB' : '#FFFFFF',
                        color: active ? '#A16207' : '#57534E',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {location.locationName}
                    </button>
                  );
                })}
                {locationFilter ? (
                  <button
                    onClick={() => setLocationFilter('')}
                    style={secondaryFilterButtonStyle}
                  >
                    Clear location
                  </button>
                ) : null}
              </div>
            </div>

            {error ? (
              <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 12 }}>
                {error}
              </p>
            ) : null}

            {loading ? (
              <div style={emptyPanelStyle}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={emptyPanelStyle}>
                {statusFilter
                  ? `No ${FILTERS.find((filter) => filter.value === statusFilter)?.label.toLowerCase()} in this view.`
                  : locationFilter
                    ? `No orders for ${locationFilter}.`
                    : 'No orders yet.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {upcomingOrders.length > 0 ? (
                  <>
                    <LaneHeader title="Upcoming orders" count={upcomingOrders.length} />
                    {upcomingOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </>
                ) : null}

                {pastOrders.length > 0 ? (
                  <>
                    <LaneHeader title="Past orders" count={pastOrders.length} />
                    {pastOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </>
                ) : null}
              </div>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 20,
                }}
              >
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={pagerButtonStyle(page === 1)}
                >
                  Previous
                </button>
                <span style={{ fontSize: 13, color: '#78716C' }}>
                  {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  style={pagerButtonStyle(page === pagination.totalPages)}
                >
                  Next
                </button>
              </div>
            ) : null}
      </section>

      {/* 3. Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        <QuickAccessCard eyebrow="AI Sales Engine" title="Re-engage catering customers" href="/follow-ups" linkText="Open Follow-Ups →" stats={[{ label: 'Total customers', value: String(stats?.totalCustomers ?? 0) }, { label: 'Repeat customers', value: String(stats?.repeatCustomers ?? 0) }]} />
        <QuickAccessCard eyebrow="Revenue Intelligence" title="Revenue trends and actions" href="/revenue-intelligence" linkText="Open Revenue Report →" stats={[{ label: '30-day revenue', value: stats ? money(stats.last30DaysRevenue) : '$0' }, { label: 'Avg order value', value: stats ? money(stats.avgOrderValue) : '$0' }]} />
        <QuickAccessCard eyebrow="Customers" title="Customer intelligence" href="/customers" linkText="Open Customers →" stats={[{ label: 'Total customers', value: String(stats?.totalCustomers ?? 0) }, { label: 'Repeat customers', value: String(stats?.repeatCustomers ?? 0) }]} />
      </div>

      {/* 4. Storefront Live → Plan Lane → Command Shelf (all full-width) */}
      <SetupChecklist />

      {currentPlanDisplay ? (
        <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={sectionEyebrowStyle}>Plan lane</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C1917', margin: '4px 0 0' }}>{currentPlanDisplay.label} is active</h2>
            </div>
            <a href="/billing" style={inlineLinkStyle}>Open billing and plan</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            <PlanSummaryCard label="Included now" title={currentPlanDisplay.label} body={currentPlanDisplay.highlights.join(' | ')} />
            <PlanSummaryCard label="Next unlock" title={nextPlanDisplay?.label ?? 'Top plan active'} body={nextPlanDisplay ? nextPlanDisplay.highlights.join(' | ') : 'Highest plan features available.'} />
            <PlanSummaryCard label="Plan price" title={currentPlanPriceLabel} body="Billing controls upgrades, downgrades, and add-on access from one place." />
          </div>
        </section>
      ) : null}

      <ActionShelf storefrontUrl={storefrontContext?.storefrontUrl ?? null} totalRevenue={stats?.last30DaysRevenue ?? 0} last7DaysOrders={stats?.last7DaysOrders ?? 0} repeatCustomers={stats?.repeatCustomers ?? 0} />

      {/* 5. Growth Copilot — horizontal bar */}
      <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: 'linear-gradient(135deg, #1C1917 0%, #292524 55%, #44403C 100%)', color: '#FAFAF9', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <div style={sectionEyebrowStyle}>Growth Copilot</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#FAFAF9', margin: '4px 0 0' }}>What to price, upsell, reorder, and fix next</h2>
          </div>
          <a href="/growth-advisor" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', borderRadius: 12, background: '#D4A853', color: '#1C1917', fontSize: 13, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {growthAdvisorUnlocked ? 'Open Growth Copilot' : 'Unlock Growth Advisor'}
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
          {copilotInsights.map((insight) => (
            <CopilotInsightCard key={insight.key} insight={insight} unlocked={growthAdvisorUnlocked} />
          ))}
        </div>
      </section>

    </div>
  );
}

function QuickAccessCard({
  eyebrow,
  title,
  href,
  linkText,
  stats,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkText: string;
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #E7E5E4',
        borderRadius: 16,
        background: '#FFFFFF',
        padding: 20,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917', lineHeight: 1.3, marginBottom: 16 }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1C1917' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E85618' }}>
        {linkText}
      </div>
    </a>
  );
}

function ActionShelf({
  storefrontUrl,
  totalRevenue,
  last7DaysOrders,
  repeatCustomers,
}: {
  storefrontUrl: string | null;
  totalRevenue: number;
  last7DaysOrders: number;
  repeatCustomers: number;
}) {
  return (
    <section
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 18,
        background: '#FFFFFF',
        padding: 20,
        display: 'grid',
        gap: 14,
      }}
    >
      <div>
        <div style={sectionEyebrowStyle}>Command shelf</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1C1917',
            margin: '4px 0 6px',
          }}
        >
          High-leverage moves
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
          Keep the operator moves close: test the storefront, tighten plan access,
          and act on repeat-revenue signals.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <QuickActionCard
          title="Place a test order"
          body="Validate the customer experience before sharing the storefront more widely."
          ctaLabel={storefrontUrl ? 'Open storefront' : 'Open Launch Center'}
          href={storefrontUrl ?? '/launch'}
          external={Boolean(storefrontUrl)}
        />
        <QuickActionCard
          title="Review billing and features"
          body="Plan access is now tier-aware, so billing is where upgrades and locked capabilities get resolved."
          ctaLabel="Open billing"
          href="/billing"
        />
        <QuickActionCard
          title="Tighten offerings"
          body="Adjust menu structure, minimums, and templates before the next repeat-order push."
          ctaLabel="Open offerings"
          href="/catalog"
        />
      </div>

      <div
        style={{
          borderRadius: 16,
          background: '#FAFAF9',
          border: '1px solid #EEEAE4',
          padding: 16,
        }}
      >
        <div style={sectionEyebrowStyle}>Signal snapshot</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <ShelfMetric label="30-day revenue" value={money(totalRevenue)} />
          <ShelfMetric label="Orders this week" value={String(last7DaysOrders)} />
          <ShelfMetric label="Repeat customers" value={String(repeatCustomers)} />
        </div>
      </div>
    </section>
  );
}

function TriageLane({
  title,
  subtitle,
  orders,
  accent,
  empty,
}: {
  title: string;
  subtitle: string;
  orders: Order[];
  accent: string;
  empty: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #E7E5E4',
        background: '#FAFAF9',
        padding: 16,
        display: 'grid',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              padding: '4px 10px',
              borderRadius: 999,
              background: `${accent}18`,
              color: accent,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            {subtitle}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', lineHeight: 1 }}>
          {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ fontSize: 12, color: '#78716C', lineHeight: 1.6 }}>{empty}</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.slice(0, 3).map((order) => (
            <a
              key={order.id}
              href={`/orders/${order.id}`}
              style={{
                textDecoration: 'none',
                borderRadius: 12,
                border: '1px solid #EEEAE4',
                background: '#FFFFFF',
                padding: '10px 12px',
                display: 'grid',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>
                {order.customer.name}
              </div>
              <div style={{ fontSize: 12, color: '#57534E' }}>
                {shortDate(order.eventDate)} | {order.headCount} guests | {money(order.pricing.total)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.submitted;
  const dc = order.deposit
    ? DEPOSIT_CONFIG[order.deposit.status] ?? DEPOSIT_CONFIG.pending
    : null;
  const isHighValue = order.pricing.total > 50000;
  const isSoon = isWithin48Hours(order.eventDate);

  return (
    <a href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) auto',
          gap: 14,
          alignItems: 'center',
          background: '#FFFFFF',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: '#78716C',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {order.orderNumber}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>
              {order.customer.name}
            </span>
            <span style={statusPillStyle(sc.bg, sc.color)}>{sc.label}</span>
            {dc ? <span style={statusPillStyle(dc.bg, dc.color)}>{dc.label}</span> : null}
            {isSoon ? (
              <span style={statusPillStyle('#FEF3C7', '#92400E')}>Due soon</span>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#57534E',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              lineHeight: 1.6,
            }}
          >
            <span>{shortDate(order.eventDate)}</span>
            <span>|</span>
            <span>{order.headCount} guests</span>
            <span>|</span>
            <span>{order.itemCount} items</span>
            {order.customer.company ? (
              <>
                <span>|</span>
                <span>{order.customer.company}</span>
              </>
            ) : null}
            {order.location ? (
              <>
                <span>|</span>
                <span>{order.location.name}</span>
              </>
            ) : null}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 120 }}>
          <div style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>{sc.lane}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>
            {isHighValue ? '$' : ''}
            {money(order.pricing.total).replace('$', '')}
          </div>
        </div>
      </div>
    </a>
  );
}

function LaneHeader({ title, count }: { title: string; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#78716C' }}>{count}</div>
    </div>
  );
}

function MissionChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(250,250,249,0.64)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#FAFAF9' }}>{value}</span>
    </div>
  );
}

function MissionMetricRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'start',
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(250,250,249,0.78)' }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(250,250,249,0.6)',
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {detail}
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#FAFAF9' }}>{value}</div>
    </div>
  );
}

function PulseRow({
  day,
  maxRevenue,
}: {
  day: DailyRevenue;
  maxRevenue: number;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '48px minmax(0, 1fr) 64px',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 12, color: 'rgba(250,250,249,0.68)' }}>{getDayName(day.date)}</span>
      <div
        style={{
          background: 'rgba(255,255,255,0.08)',
          height: 8,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%`,
            height: '100%',
            background: '#FCD34D',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#FAFAF9',
          textAlign: 'right',
        }}
      >
        {money(day.revenue)}
      </span>
    </div>
  );
}

function PlanSummaryCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #EEEAE4',
        borderRadius: 14,
        background: '#FAFAF9',
        padding: '14px 16px',
      }}
    >
      <div style={sectionEyebrowStyle}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: '#1C1917',
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function CopilotInsightCard({
  insight,
  unlocked,
}: {
  insight: CopilotInsight;
  unlocked: boolean;
}) {
  return (
    <section
      style={{
        border: unlocked ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        background: unlocked ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.05)',
        padding: 16,
        display: 'grid',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '5px 9px',
            borderRadius: 999,
            background: unlocked ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.16)',
            color: '#FDE68A',
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {insight.label}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#FAFAF9' }}>{insight.stat}</div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25, color: '#FAFAF9' }}>
        {insight.title}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(250,250,249,0.76)' }}>
        {insight.summary}
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(250,250,249,0.62)' }}>
        {insight.detail}
      </div>

      <a
        href={insight.href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          padding: '9px 12px',
          borderRadius: 10,
          background: unlocked ? '#FAFAF9' : 'rgba(250,250,249,0.14)',
          color: unlocked ? '#1C1917' : '#FAFAF9',
          fontSize: 12,
          fontWeight: 800,
          textDecoration: 'none',
        }}
      >
        {insight.actionLabel}
      </a>
    </section>
  );
}

function QuickActionCard({
  title,
  body,
  ctaLabel,
  href,
  external,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      style={{
        display: 'grid',
        gap: 8,
        borderRadius: 14,
        border: '1px solid #EEEAE4',
        background: '#FAFAF9',
        padding: '14px 16px',
        textDecoration: 'none',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.6 }}>{body}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207' }}>{ctaLabel}</div>
    </a>
  );
}

function ShelfMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#57534E' }}>{label}</span>
      <span style={{ fontWeight: 800, color: '#1C1917' }}>{value}</span>
    </div>
  );
}

const heroEyebrowStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#FCD34D',
};

const sectionEyebrowStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#A16207',
};

const heroPrimaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '11px 16px',
  borderRadius: 999,
  background: '#F97316',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};

const heroSecondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '11px 16px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#FAFAF9',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};

const inlineLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid #E7E5E4',
  background: '#FFFFFF',
  color: '#1C1917',
  fontSize: 12,
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryFilterButtonStyle = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid #E7E5E4',
  background: '#FFFFFF',
  color: '#57534E',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const emptyPanelStyle = {
  border: '1px dashed #D6D3D1',
  borderRadius: 14,
  padding: 32,
  textAlign: 'center' as const,
  color: '#78716C',
  background: '#FAFAF9',
};

function statusPillStyle(background: string, color: string) {
  return {
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
  };
}

function pagerButtonStyle(disabled: boolean) {
  return {
    padding: '8px 14px',
    border: '1px solid #E7E5E4',
    borderRadius: 999,
    background: '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13,
    color: disabled ? '#D6D3D1' : '#57534E',
  };
}
