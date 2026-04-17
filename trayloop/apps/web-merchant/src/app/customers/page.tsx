'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchCustomer,
  fetchCustomers,
  fetchOrderStats,
  type MerchantCustomerDetail,
  type MerchantCustomerSummary,
  type MerchantOrderStats,
} from '../../lib/api';
import { hasMerchantSession } from '../../lib/session';
import { daysSince, formatDate, formatMoney } from '../../lib/format';

type View = 'reorder' | 'risk' | 'value' | 'all';

interface ScoredCustomer extends MerchantCustomerSummary {
  daysSinceLastOrder: number | null;
  reorderScore: number;
  riskScore: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<MerchantCustomerSummary[]>([]);
  const [stats, setStats] = useState<MerchantOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('reorder');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<MerchantCustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState<string>('');

  useEffect(() => {
    if (!hasMerchantSession()) {
      window.location.href = '/login';
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [nextCustomers, nextStats] = await Promise.all([fetchCustomers(), fetchOrderStats()]);
        if (!active) return;
        setCustomers(nextCustomers);
        setStats(nextStats);
        setRefreshedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load customer intelligence');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const scored = useMemo(() => customers
    .filter((customer) => matchesSearch(customer, search))
    .map((customer) => {
      const daysSinceLastOrder = daysSince(customer.lastOrderDate);
      return {
        ...customer,
        daysSinceLastOrder,
        reorderScore: scoreReorder(customer, daysSinceLastOrder),
        riskScore: scoreRisk(customer, daysSinceLastOrder),
      };
    }), [customers, search]);

  const insights = useMemo(() => {
    const totalCustomers = stats?.totalCustomers ?? scored.length;
    const repeatCustomers = stats?.repeatCustomers ?? scored.filter((c) => c.orderCount > 1).length;
    const repeatSpend = scored.filter((c) => c.orderCount > 1).reduce((sum, c) => sum + c.totalSpend, 0);
    const atRiskCustomers = scored.filter((c) => isAtRisk(c));
    const likelyToReorder = scored.filter((c) => isLikelyToReorder(c));
    const valueCustomers = [...scored].sort((a, b) => b.totalSpend - a.totalSpend);
    const repeatOrders = scored.reduce((sum, c) => sum + Math.max(0, c.orderCount - 1), 0);

    return {
      totalCustomers,
      repeatCustomers,
      repeatRate: totalCustomers > 0 ? repeatCustomers / totalCustomers : 0,
      repeatSpend,
      atRiskCustomers,
      likelyToReorder,
      valueCustomers,
      repeatOrders,
      totalOrders: stats?.totalOrders ?? scored.reduce((sum, c) => sum + c.orderCount, 0),
    };
  }, [scored, stats]);

  const visibleCustomers = useMemo(() => {
    switch (view) {
      case 'risk':
        return [...insights.atRiskCustomers].sort((a, b) => b.riskScore - a.riskScore);
      case 'value':
        return [...insights.valueCustomers];
      case 'all':
        return [...scored].sort((a, b) => b.totalSpend - a.totalSpend);
      case 'reorder':
      default:
        return [...insights.likelyToReorder].sort((a, b) => b.reorderScore - a.reorderScore);
    }
  }, [insights.atRiskCustomers, insights.likelyToReorder, insights.valueCustomers, scored, view]);

  useEffect(() => {
    if (visibleCustomers.length === 0) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (!selectedId || !visibleCustomers.some((customer) => customer.id === selectedId)) {
      setSelectedId(visibleCustomers[0].id);
    }
  }, [selectedId, visibleCustomers]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedCustomer(null);
      return;
    }

    let active = true;
    setDetailLoading(true);
    setDetailError('');

    void fetchCustomer(selectedId)
      .then((next) => {
        if (active) setSelectedCustomer(next);
      })
      .catch((err) => {
        if (active) setDetailError(err instanceof Error ? err.message : 'Failed to load customer detail');
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  const premiumReady = insights.totalCustomers >= 5 && insights.totalOrders >= 8;
  const repeatOrderMultiple = insights.repeatCustomers > 0 ? insights.totalOrders / insights.repeatCustomers : 0;
  const repeatShare = insights.totalOrders > 0 ? insights.repeatOrders / insights.totalOrders : 0;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={heroStyle}>
        <div style={heroHeadStyle}>
          <div>
            <div style={eyebrowStyle}>Customer Intelligence</div>
            <h1 style={titleStyle}>Segmented retention workspace</h1>
            <p style={ledeStyle}>
              Track who is most likely to reorder, who is slipping into risk, and which accounts carry the most value.
            </p>
          </div>
          <div style={refreshPillStyle}>
            <div style={smallLabelStyle}>Refreshed</div>
            <div style={refreshValueStyle}>{refreshedAt || 'Loading'}</div>
          </div>
        </div>

        <div style={metricGridStyle}>
          <Metric label="Repeat Rate" value={formatPercent(insights.repeatRate)} sub={`${insights.repeatCustomers} of ${insights.totalCustomers} customers`} dark />
          <Metric label="At-Risk Revenue" value={formatMoney(insights.atRiskCustomers.reduce((sum, c) => sum + c.totalSpend, 0))} sub={`${insights.atRiskCustomers.length} accounts`} />
          <Metric label="Avg Order Value" value={formatMoney(stats?.avgOrderValue ?? 0)} sub="From merchant history" />
          <Metric label="Repeat Multiple" value={repeatOrderMultiple > 0 ? `${repeatOrderMultiple.toFixed(1)}x` : '--'} sub="Orders per repeat customer" />
        </div>
      </section>

      <section className="tl-split-main">
        <div style={{ minWidth: 0, display: 'grid', gap: 12 }}>
          <div style={toolbarStyle}>
            <div style={tabRowStyle}>
              {TABS.map((tab) => {
                const active = view === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setView(tab.key)}
                    style={{
                      ...tabStyle,
                      background: active ? '#1C1917' : '#FFFFFF',
                      color: active ? '#FAFAF9' : '#57534E',
                      borderColor: active ? '#1C1917' : '#E7E5E4',
                    }}
                  >
                    {tab.label}
                    <span style={{ marginLeft: 8, color: active ? 'rgba(250,250,249,0.7)' : '#A8A29E' }}>
                      {countForTab(tab.key, insights, scored)}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or company"
              style={searchStyle}
            />
          </div>

          {error ? <Banner tone="danger" title="Unable to load customer intelligence" body={error} /> : null}
          {loading ? <Banner tone="neutral" title="Loading customer intelligence" body="Fetching customer roster and order stats..." /> : null}

          {!loading && !error && visibleCustomers.length === 0 ? (
            <EmptyState
              title={search ? 'No customers match this search' : 'No customers in this segment'}
              body={search ? 'Try a broader query or clear the search field.' : 'This segment will populate as order history grows.'}
            />
          ) : null}

          {!loading && !error && visibleCustomers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => setSelectedId(customer.id)}
              style={{
                ...rowStyle,
                borderColor: customer.id === selectedId ? '#1C1917' : '#E7E5E4',
                boxShadow: customer.id === selectedId ? '0 10px 30px rgba(28,25,23,0.08)' : 'none',
              }}
            >
              <div style={{ minWidth: 0, textAlign: 'left' }}>
                <div style={rowTopStyle}>
                  <span style={rowNameStyle}>{customer.name}</span>
                  <SegmentBadge customer={customer} view={view} />
                </div>
                <div style={rowMetaStyle}>
                  {customer.company ? <span>{customer.company}</span> : null}
                  <Dot />
                  <span>{customer.email}</span>
                  <Dot />
                  <span>{customer.orderCount} orders</span>
                  <Dot />
                  <span>{customer.daysSinceLastOrder === null ? 'No history' : `${customer.daysSinceLastOrder}d since last order`}</span>
                </div>
              </div>
              <div style={rowStatsStyle}>
                <div style={rowSpendStyle}>{formatMoney(customer.totalSpend)}</div>
                <div style={rowSubtleStyle}>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never ordered'}</div>
              </div>
            </button>
          ))}

          <div style={insightStripStyle}>
            <Tile label="New vs repeat" value={`${formatPercent(insights.repeatCustomers / Math.max(insights.totalCustomers, 1))} repeat`} sub={`${formatPercent(1 - repeatShare)} new by order mix`} />
            <Tile label="Repeat spend" value={formatMoney(insights.repeatSpend)} sub={`${formatPercent(repeatShare)} of all orders`} />
            <Tile label="Likely to reorder" value={`${insights.likelyToReorder.length}`} sub="Warm accounts ready for the next touch" />
          </div>
        </div>

        <aside style={detailPaneStyle}>
          <div style={detailHeaderStyle}>
            <div>
              <div style={eyebrowStyle}>Selected account</div>
              <h2 style={detailTitleStyle}>Customer detail</h2>
            </div>
            {selectedCustomer ? <Badge tone={isDetailAtRisk(selectedCustomer) ? 'warn' : 'success'}>{detailLabel(selectedCustomer)}</Badge> : null}
          </div>

          {detailLoading ? <Banner tone="neutral" title="Loading customer detail" body="Pulling recent orders and account context..." /> : null}
          {detailError ? <Banner tone="danger" title="Could not load customer detail" body={detailError} /> : null}

          {selectedCustomer && !detailLoading && !detailError ? (
            <>
              <div style={detailCardStyle}>
                <div style={detailTopStyle}>
                  <div>
                    <div style={detailNameStyle}>{selectedCustomer.name}</div>
                    <div style={subtleTextStyle}>{selectedCustomer.company || 'Independent customer'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={detailSpendStyle}>{formatMoney(selectedCustomer.totalSpend)}</div>
                    <div style={subtleTextStyle}>{selectedCustomer.orderCount} orders</div>
                  </div>
                </div>

                <div style={contactGridStyle}>
                  <Contact label="Email" value={selectedCustomer.email} />
                  {selectedCustomer.phone ? <Contact label="Phone" value={selectedCustomer.phone} /> : null}
                  <Contact label="Status" value={selectedCustomer.isActive ? 'Active' : 'Inactive'} />
                  <Contact label="Last order" value={selectedCustomer.recentOrders[0]?.eventDate ? formatDate(selectedCustomer.recentOrders[0].eventDate) : 'None'} />
                </div>

                <div style={nextActionStyle}>
                  <div style={smallLabelStyle}>Next best action</div>
                  <div style={nextActionTextStyle}>{nextBestAction(selectedCustomer)}</div>
                </div>
              </div>

              <div style={detailCardStyle}>
                <div style={sectionLabelStyle}>Recent orders</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {selectedCustomer.recentOrders.length > 0 ? selectedCustomer.recentOrders.map((order) => (
                    <a key={order.id} href={`/orders/${order.id}`} style={orderLinkStyle}>
                      <div>
                        <div style={orderNumberStyle}>{order.orderNumber}</div>
                        <div style={orderDateStyle}>{order.eventDate ? formatDate(order.eventDate) : formatDate(order.createdAt)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={orderSpendStyle}>{formatMoney(order.total)}</div>
                        <div style={statusStyle(order.status).style}>{statusStyle(order.status).label}</div>
                      </div>
                    </a>
                  )) : <p style={{ margin: 0, color: '#78716C', fontSize: 13 }}>No recent orders.</p>}
                </div>
              </div>

              <div style={premiumNoteStyle}>
                <div style={premiumEyebrowStyle}>Retention cue</div>
                <div style={premiumNoteTextStyle}>
                  The workspace sorts accounts with a local intelligence score built from repeat behavior, spend, and recency.
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Pick a customer" body="Select a row to see contact details, recent orders, and the next best action." />
          )}
        </aside>
      </section>

      {!loading && !error && !premiumReady ? (
        <section style={engineGateStyle}>
          <div style={premiumEyebrowStyle}>Engine-level analytics</div>
          <div style={engineGateTitleStyle}>More advanced cohort modeling needs a little more history</div>
          <p style={engineGateBodyStyle}>
            The customer roster already supports reorder, risk, and value workflows. Once this merchant has more order history, deeper cohort modeling can layer in without adding noise.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function matchesSearch(customer: MerchantCustomerSummary, search: string) {
  if (!search) return true;
  const q = search.toLowerCase();
  return customer.name.toLowerCase().includes(q)
    || customer.email.toLowerCase().includes(q)
    || (customer.company?.toLowerCase().includes(q) ?? false);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function scoreReorder(customer: MerchantCustomerSummary, daysSinceLastOrder: number | null) {
  if (customer.orderCount < 2 || daysSinceLastOrder === null) return -1;
  return customer.orderCount * 10 + Math.max(0, 60 - daysSinceLastOrder) + Math.min(customer.totalSpend / 1000, 25);
}

function scoreRisk(customer: MerchantCustomerSummary, daysSinceLastOrder: number | null) {
  if (customer.orderCount < 2 || daysSinceLastOrder === null) return -1;
  if (daysSinceLastOrder < 21) return 0;
  return (daysSinceLastOrder - 20) * 2 + Math.min(customer.totalSpend / 1000, 30);
}

function isLikelyToReorder(customer: ScoredCustomer) {
  return customer.orderCount > 1 && (customer.daysSinceLastOrder ?? 999) <= 45;
}

function isAtRisk(customer: ScoredCustomer) {
  return customer.orderCount > 1 && (customer.daysSinceLastOrder ?? 0) >= 45;
}

function isDetailAtRisk(customer: MerchantCustomerDetail) {
  const days = customer.recentOrders[0]?.eventDate ? daysSince(customer.recentOrders[0].eventDate) : null;
  return customer.orderCount > 1 && (days ?? 0) >= 45;
}

function nextBestAction(customer: MerchantCustomerDetail) {
  const days = customer.recentOrders[0]?.eventDate ? daysSince(customer.recentOrders[0].eventDate) : null;
  if (days === null) return 'This is a new customer. Start a reorder motion and capture the preferred cadence.';
  if (days >= 45) return 'This account is at risk. Send a reorder reminder or a low-friction re-engagement offer.';
  if (days <= 14 && customer.orderCount > 1) return 'This account is warm. A reorder nudge or seasonal upsell is likely to land.';
  if (customer.totalSpend >= 100000) return 'Protect this high-value account with a personal check-in and priority handling.';
  return 'Keep this customer in the reorder lane and follow up before the next event window closes.';
}

function detailLabel(customer: MerchantCustomerDetail) {
  const days = customer.recentOrders[0]?.eventDate ? daysSince(customer.recentOrders[0].eventDate) : null;
  if (days === null) return 'New';
  if (days >= 45) return 'At risk';
  if (customer.orderCount > 1) return 'Repeat';
  return 'Active';
}

function statusStyle(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', style: { fontSize: 11, color: '#166534' } };
    case 'confirmed':
      return { label: 'Confirmed', style: { fontSize: 11, color: '#1E40AF' } };
    case 'awaiting_deposit':
      return { label: 'Awaiting deposit', style: { fontSize: 11, color: '#92400E' } };
    case 'cancelled':
      return { label: 'Cancelled', style: { fontSize: 11, color: '#991B1B' } };
    default:
      return { label: status.replace(/_/g, ' '), style: { fontSize: 11, color: '#57534E' } };
  }
}

function countForTab(view: View, insights: {
  likelyToReorder: ScoredCustomer[];
  atRiskCustomers: ScoredCustomer[];
  valueCustomers: ScoredCustomer[];
}, allCustomers: ScoredCustomer[]) {
  switch (view) {
    case 'risk':
      return insights.atRiskCustomers.length;
    case 'value':
      return insights.valueCustomers.length;
    case 'all':
      return allCustomers.length;
    case 'reorder':
    default:
      return insights.likelyToReorder.length;
  }
}

function Metric({ label, value, sub, dark = false }: { label: string; value: string; sub: string; dark?: boolean }) {
  return (
    <div style={{
      borderRadius: 18,
      padding: '16px 18px',
      border: dark ? 'none' : '1px solid #E7E5E4',
      background: dark ? '#1C1917' : '#FFFFFF',
      boxShadow: dark ? '0 16px 40px rgba(28,25,23,0.16)' : 'none',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? '#D4A853' : '#78716C', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: dark ? '#FAFAF9' : '#1C1917', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: dark ? '#D6D3D1' : '#A8A29E', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFDF8', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#78716C', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function SegmentBadge({ customer, view }: { customer: ScoredCustomer; view: View }) {
  if (view === 'risk') return <Badge tone={isAtRisk(customer) ? 'warn' : 'neutral'}>{isAtRisk(customer) ? 'Risk' : 'Stable'}</Badge>;
  if (view === 'value') return <Badge tone="neutral">{customer.totalSpend >= 100000 ? 'High value' : 'Value'}</Badge>;
  if (view === 'all') return <Badge tone={customer.orderCount > 1 ? 'success' : 'neutral'}>{customer.orderCount > 1 ? 'Repeat' : 'New'}</Badge>;
  return <Badge tone={isLikelyToReorder(customer) ? 'success' : 'neutral'}>{isLikelyToReorder(customer) ? 'Likely to reorder' : 'Watch'}</Badge>;
}

function Badge({ tone, children }: { tone: 'neutral' | 'success' | 'warn'; children: React.ReactNode }) {
  const map = {
    neutral: { background: '#F3F4F6', color: '#57534E' },
    success: { background: '#DCFCE7', color: '#166534' },
    warn: { background: '#FEF3C7', color: '#92400E' },
  } as const;

  return <span style={{ ...map[tone], fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>{children}</span>;
}

function Contact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, padding: '10px 12px', background: '#FFFFFF', minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

function Dot() {
  return <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D6D3D1', display: 'inline-block' }} />;
}

function Banner({ tone, title, body }: { tone: 'neutral' | 'danger'; title: string; body: string }) {
  return (
    <div style={{
      border: tone === 'danger' ? '1px solid #FECACA' : '1px solid #E7E5E4',
      borderRadius: 18,
      background: tone === 'danger' ? '#FEF2F2' : '#FFFDF8',
      padding: 16,
      color: tone === 'danger' ? '#991B1B' : '#57534E',
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, color: tone === 'danger' ? '#991B1B' : '#1C1917' }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: '1px dashed #D6D3D1', borderRadius: 18, background: '#FFFDF8', padding: 18 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1C1917', marginBottom: 6 }}>{title}</div>
      <p style={{ margin: 0, color: '#78716C', fontSize: 13, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}


const heroStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 24,
  background: 'linear-gradient(135deg, #FFFDF8 0%, #FAFAF9 45%, #F6F1E7 100%)',
  padding: 24,
  boxShadow: '0 20px 50px rgba(28,25,23,0.06)',
};

const heroHeadStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#D4A853',
  marginBottom: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: 32,
  lineHeight: 1.08,
  margin: '0 0 12px',
  color: '#1C1917',
  letterSpacing: '-0.03em',
};

const ledeStyle: React.CSSProperties = {
  margin: 0,
  color: '#57534E',
  fontSize: 15,
  lineHeight: 1.7,
  maxWidth: 720,
};

const refreshPillStyle: React.CSSProperties = {
  minWidth: 160,
  borderRadius: 18,
  padding: '14px 16px',
  border: '1px solid #E7E5E4',
  background: '#FFFFFF',
};

const smallLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#78716C',
  marginBottom: 4,
};

const refreshValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1C1917',
};

const metricGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginTop: 20,
};

const workspaceStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 360px)',
  gap: 20,
  alignItems: 'start',
  width: '100%',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const tabStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderRadius: 999,
  border: '1px solid #E7E5E4',
  background: '#FFFFFF',
  color: '#57534E',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
};

const searchStyle: React.CSSProperties = {
  minWidth: 240,
  flex: '1 1 240px',
  maxWidth: 340,
  height: 42,
  padding: '0 14px',
  border: '1px solid #D6D3D1',
  borderRadius: 12,
  background: '#FFFFFF',
  outline: 'none',
  fontSize: 14,
  color: '#1C1917',
  boxSizing: 'border-box',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  width: '100%',
  textAlign: 'left',
  background: '#FFFFFF',
  border: '1px solid #E7E5E4',
  borderRadius: 18,
  padding: '16px 18px',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const rowTopStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 6,
  flexWrap: 'wrap',
};

const rowNameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: '#1C1917',
};

const rowMetaStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  fontSize: 12,
  color: '#78716C',
};

const rowStatsStyle: React.CSSProperties = {
  textAlign: 'right',
  flexShrink: 0,
};

const rowSpendStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: '#1C1917',
};

const rowSubtleStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#78716C',
  marginTop: 3,
};

const insightStripStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
};

const detailPaneStyle: React.CSSProperties = {
  position: 'sticky',
  top: 24,
  display: 'grid',
  gap: 14,
};

const detailHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

const detailTitleStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1.15,
  margin: '0 0 6px',
  color: '#1C1917',
};

const detailCardStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 18,
  background: '#FFFDF8',
  padding: 18,
};

const detailTopStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

const detailNameStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: '#1C1917',
};

const subtleTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#78716C',
  marginTop: 4,
};

const detailSpendStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: '#1C1917',
};

const contactGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  marginTop: 16,
};

const nextActionStyle: React.CSSProperties = {
  marginTop: 16,
  borderTop: '1px solid #EEEAE4',
  paddingTop: 14,
};

const nextActionTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1C1917',
  lineHeight: 1.5,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#78716C',
  marginBottom: 10,
};

const orderLinkStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  border: '1px solid #E7E5E4',
  borderRadius: 14,
  padding: '10px 12px',
  textDecoration: 'none',
  color: 'inherit',
  background: '#FFFFFF',
};

const orderNumberStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: '#1C1917',
  fontFamily: 'monospace',
};

const orderDateStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#78716C',
  marginTop: 2,
};

const orderSpendStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1C1917',
};

const premiumNoteStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 18,
  background: '#17130E',
  color: '#FAF9F7',
  padding: 18,
};

const premiumEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#D4A853',
  marginBottom: 8,
};

const premiumNoteTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.5,
  color: '#FAF9F7',
};

const engineGateStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 18,
  background: '#FFFFFF',
  padding: 18,
};

const engineGateTitleStyle: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1.2,
  margin: '0 0 8px',
  color: '#1C1917',
};

const engineGateBodyStyle: React.CSSProperties = {
  margin: 0,
  color: '#57534E',
  fontSize: 13,
  lineHeight: 1.7,
  maxWidth: 720,
};

const TABS: Array<{ key: View; label: string }> = [
  { key: 'reorder', label: 'Likely to reorder' },
  { key: 'risk', label: 'At risk' },
  { key: 'value', label: 'Value' },
  { key: 'all', label: 'All customers' },
];
