'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCustomers, fetchOrderStats, type MerchantCustomerSummary, type MerchantOrderStats } from '../../lib/api';

export default function RevenueIntelligencePage() {
  const [customers, setCustomers] = useState<MerchantCustomerSummary[]>([]);
  const [stats, setStats] = useState<MerchantOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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
        if (active) setError(err instanceof Error ? err.message : 'Failed to load revenue intelligence');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const cohort = useMemo(() => customers.map((customer) => ({
    ...customer,
    daysSinceLastOrder: daysSince(customer.lastOrderDate),
  })), [customers]);

  const metrics = useMemo(() => {
    const totalOrders = stats?.totalOrders ?? cohort.reduce((sum, customer) => sum + customer.orderCount, 0);
    const totalRevenue = stats?.totalRevenue ?? cohort.reduce((sum, customer) => sum + customer.totalSpend, 0);
    const repeatCustomers = cohort.filter((customer) => customer.orderCount > 1);
    const newCustomers = cohort.filter((customer) => customer.orderCount === 1);
    const repeatRevenue = repeatCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
    const repeatOrders = repeatCustomers.reduce((sum, customer) => sum + Math.max(0, customer.orderCount - 1), 0);
    const atRiskCustomers = repeatCustomers.filter((customer) => (customer.daysSinceLastOrder ?? 0) >= 45);
    const atRiskRevenue = atRiskCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
    const newRevenue = newCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);

    return {
      totalOrders,
      totalRevenue,
      repeatCustomers,
      newCustomers,
      repeatRevenue,
      repeatOrders,
      atRiskCustomers,
      atRiskRevenue,
      newRevenue,
      repeatShare: totalOrders > 0 ? repeatOrders / totalOrders : 0,
      repeatRate: cohort.length > 0 ? repeatCustomers.length / cohort.length : 0,
      repeatAov: repeatOrders > 0 ? repeatRevenue / repeatOrders : 0,
      repeatCustomerValue: repeatCustomers.length > 0 ? repeatRevenue / repeatCustomers.length : 0,
      ordersPerCustomer: cohort.length > 0 ? totalOrders / cohort.length : 0,
    };
  }, [cohort, stats]);

  const valueLeaders = useMemo(() => [...cohort].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5), [cohort]);
  const atRiskLeaders = useMemo(() => [...metrics.atRiskCustomers].sort((a, b) => (b.daysSinceLastOrder ?? 0) - (a.daysSinceLastOrder ?? 0)).slice(0, 5), [metrics.atRiskCustomers]);
  const repeatFrequencyReady = cohort.length >= 5 && metrics.totalOrders >= 8;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={heroStyle}>
        <div style={heroHeadStyle}>
          <div>
            <div style={eyebrowStyle}>Revenue Intelligence</div>
            <h1 style={titleStyle}>Repeat behavior and LTV-style signals</h1>
            <p style={ledeStyle}>
              See how much revenue comes from repeat buyers, which accounts are cooling off, and how the mix shifts between new and returning customers.
            </p>
          </div>
          <div style={refreshPillStyle}>
            <div style={smallLabelStyle}>Refreshed</div>
            <div style={refreshValueStyle}>{refreshedAt || 'Loading'}</div>
          </div>
        </div>

        <div style={metricGridStyle}>
          <Metric label="Total Revenue" value={formatMoney(metrics.totalRevenue)} sub={`${metrics.totalOrders} total orders`} dark />
          <Metric label="Repeat Revenue" value={formatMoney(metrics.repeatRevenue)} sub={`${formatPercent(metrics.repeatRate)} repeat customers`} />
          <Metric label="At-Risk Revenue" value={formatMoney(metrics.atRiskRevenue)} sub={`${metrics.atRiskCustomers.length} customers cooling`} />
          <Metric label="Repeat AOV" value={formatMoney(metrics.repeatAov)} sub="Average repeat order value" />
        </div>
      </section>

      {error ? <Banner tone="danger" title="Unable to load revenue intelligence" body={error} /> : null}
      {loading ? <Banner tone="neutral" title="Loading revenue intelligence" body="Fetching customer cohorts and order stats..." /> : null}

      {!loading && !error ? (
        <section style={workspaceStyle}>
          <div style={{ minWidth: 0, display: 'grid', gap: 12 }}>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={sectionLabelStyle}>Mix</div>
                  <div style={panelTitleStyle}>New vs repeat customers</div>
                </div>
                <Badge tone="neutral">{formatPercent(metrics.repeatRate)} repeat buyers</Badge>
              </div>
              <MixBar label="Customers" newValue={cohort.filter((c) => c.orderCount === 1).length} repeatValue={metrics.repeatCustomers.length} />
              <MixBar label="Orders" newValue={metrics.totalOrders - metrics.repeatOrders} repeatValue={metrics.repeatOrders} />
              <MixBar label="Revenue" newValue={metrics.newRevenue} repeatValue={metrics.repeatRevenue} money />
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={sectionLabelStyle}>Frequency</div>
                  <div style={panelTitleStyle}>Repeat ordering rhythm</div>
                </div>
                <Badge tone={repeatFrequencyReady ? 'success' : 'neutral'}>{repeatFrequencyReady ? 'Ready' : 'Building history'}</Badge>
              </div>
              <div style={frequencyGridStyle}>
                <MiniStat label="Orders per customer" value={metrics.ordersPerCustomer > 0 ? `${metrics.ordersPerCustomer.toFixed(1)}x` : '--'} />
                <MiniStat label="Repeat customers" value={`${metrics.repeatCustomers.length}`} />
                <MiniStat label="Repeat orders" value={`${metrics.repeatOrders}`} />
                <MiniStat label="Repeat customer value" value={formatMoney(metrics.repeatCustomerValue)} />
              </div>
              {!repeatFrequencyReady ? (
                <div style={gateCalloutStyle}>
                  <div style={premiumEyebrowStyle}>Engine-level analytics</div>
                  <div style={gateTextStyle}>
                    This workspace already shows the core repeat mix. Once the merchant has more order history, the same surface can support deeper Engine-level cohort modeling.
                  </div>
                </div>
              ) : null}
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={sectionLabelStyle}>At risk</div>
                  <div style={panelTitleStyle}>Customers that need a nudge</div>
                </div>
                <Badge tone="warn">{metrics.atRiskCustomers.length} at risk</Badge>
              </div>
              <div style={listStyle}>
                {atRiskLeaders.length > 0 ? atRiskLeaders.map((customer) => (
                  <div key={customer.id} style={listRowStyle}>
                    <div>
                      <div style={listNameStyle}>{customer.name}</div>
                      <div style={listMetaStyle}>
                        {customer.company ? <span>{customer.company}</span> : null}
                        {customer.company ? <Dot /> : null}
                        <span>{customer.orderCount} orders</span>
                        <Dot />
                        <span>{customer.daysSinceLastOrder ?? 0}d since last order</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={listSpendStyle}>{formatMoney(customer.totalSpend)}</div>
                      <div style={listSubtleStyle}>LTV-style value</div>
                    </div>
                  </div>
                )) : <EmptyRow text="No at-risk customers detected yet." />}
              </div>
            </div>
          </div>

          <aside style={detailPaneStyle}>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={sectionLabelStyle}>Value leaders</div>
                  <div style={panelTitleStyle}>Highest lifetime customers</div>
                </div>
                <Badge tone="neutral">{valueLeaders.length}</Badge>
              </div>
              <div style={listStyle}>
                {valueLeaders.map((customer) => (
                  <div key={customer.id} style={listRowStyle}>
                    <div>
                      <div style={listNameStyle}>{customer.name}</div>
                      <div style={listMetaStyle}>
                        {customer.orderCount} orders
                        <Dot />
                        <span>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No recent order'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={listSpendStyle}>{formatMoney(customer.totalSpend)}</div>
                      <div style={listSubtleStyle}>Cohort value</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={sectionLabelStyle}>Summary</div>
                  <div style={panelTitleStyle}>Revenue mix signals</div>
                </div>
              </div>
              <div style={summaryStackStyle}>
                <SummaryRow label="Repeat spend share" value={formatPercent(metrics.repeatShare)} />
                <SummaryRow label="New spend" value={formatMoney(metrics.newRevenue)} />
                <SummaryRow label="Repeat customer value" value={formatMoney(metrics.repeatCustomerValue)} />
                <SummaryRow label="Orders per customer" value={metrics.ordersPerCustomer > 0 ? metrics.ordersPerCustomer.toFixed(1) : '--'} />
              </div>
            </div>
          </aside>
        </section>
      ) : null}
    </div>
  );
}

function daysSince(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function Badge({ tone, children }: { tone: 'neutral' | 'success' | 'warn'; children: React.ReactNode }) {
  const map = {
    neutral: { background: '#F3F4F6', color: '#57534E' },
    success: { background: '#DCFCE7', color: '#166534' },
    warn: { background: '#FEF3C7', color: '#92400E' },
  } as const;
  return <span style={{ ...map[tone], fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>{children}</span>;
}

function MixBar({
  label,
  newValue,
  repeatValue,
  money = false,
}: {
  label: string;
  newValue: number;
  repeatValue: number;
  money?: boolean;
}) {
  const total = Math.max(1, newValue + repeatValue);
  const newShare = (newValue / total) * 100;
  const repeatShare = 100 - newShare;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6, fontSize: 13, color: '#44403C' }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span>{money ? formatMoney(newValue + repeatValue) : `${newValue + repeatValue}`}</span>
      </div>
      <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: '#F5F5F4' }}>
        <div style={{ width: `${newShare}%`, background: '#D6D3D1' }} />
        <div style={{ width: `${repeatShare}%`, background: '#1C1917' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#78716C', marginTop: 6 }}>
        <span>New {money ? formatMoney(newValue) : newValue}</span>
        <span>Repeat {money ? formatMoney(repeatValue) : repeatValue}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{value}</div>
    </div>
  );
}

function ListRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid #EEEAE4' }}>
      <span style={{ fontSize: 13, color: '#57534E' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: '#1C1917' }}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <ListRow label={label} value={value} />;
}

function EmptyRow({ text }: { text: string }) {
  return <p style={{ margin: 0, fontSize: 13, color: '#78716C' }}>{text}</p>;
}

function Dot() {
  return <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D6D3D1', display: 'inline-block', alignSelf: 'center' }} />;
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#78716C',
  marginBottom: 10,
};

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
  gridTemplateColumns: 'minmax(0, 1.4fr) 360px',
  gap: 20,
  alignItems: 'start',
};

const panelStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 20,
  background: '#FFFFFF',
  padding: 18,
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 14,
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#1C1917',
};

const frequencyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
};

const listStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
};

const listRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  border: '1px solid #E7E5E4',
  borderRadius: 14,
  padding: '10px 12px',
  background: '#FFFDF8',
};

const listNameStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: '#1C1917',
};

const listMetaStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginTop: 3,
  fontSize: 12,
  color: '#78716C',
};

const listSpendStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1C1917',
};

const listSubtleStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#78716C',
  marginTop: 2,
};

const detailPaneStyle: React.CSSProperties = {
  position: 'sticky',
  top: 24,
  display: 'grid',
  gap: 14,
};

const summaryStackStyle: React.CSSProperties = {
  display: 'grid',
};

const gateCalloutStyle: React.CSSProperties = {
  marginTop: 14,
  border: '1px solid #E7E5E4',
  borderRadius: 16,
  background: '#17130E',
  padding: 16,
};

const gateTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#FAF9F7',
  fontSize: 13,
  lineHeight: 1.6,
};

const premiumEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#D4A853',
  marginBottom: 8,
};
