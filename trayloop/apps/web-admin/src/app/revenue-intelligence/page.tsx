'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAdminRevenueIntelligence, type AdminRevenueIntelligence } from '../../lib/api';

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'prev_month', label: 'Previous month' },
] as const;

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function pct(value: number) {
  return `${value}%`;
}

export default function AdminRevenueIntelligencePage() {
  const [range, setRange] = useState<'7d' | '30d' | 'mtd' | 'prev_month'>('30d');
  const [data, setData] = useState<AdminRevenueIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchAdminRevenueIntelligence(range)
      .then((next) => {
        if (!active) return;
        setData(next);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load revenue intelligence');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range]);

  const maxTrendRevenue = useMemo(() => {
    if (!data?.trends?.length) return 1;
    return Math.max(...data.trends.map((point) => point.totalRevenueCents), 1);
  }, [data]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Revenue Intelligence</h1>
          <p style={{ fontSize: 13, color: '#78716C', marginTop: 0 }}>
            Platform-wide revenue quality, concentration risk, repeat performance, and upsell lift across merchants.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RANGE_OPTIONS.map((option) => {
            const active = option.value === range;
            return (
              <button
                key={option.value}
                onClick={() => setRange(option.value)}
                style={{
                  borderRadius: 999,
                  padding: '8px 12px',
                  border: active ? '1px solid rgba(212,168,83,0.4)' : '1px solid #E7E5E4',
                  background: active ? 'rgba(212,168,83,0.1)' : '#FFFFFF',
                  color: active ? '#A16207' : '#57534E',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: '#78716C' }}>Loading revenue intelligence...</p>
      ) : error || !data ? (
        <div style={{ padding: 20, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, color: '#B91C1C', fontSize: 13 }}>
          {error || 'Unable to load revenue intelligence.'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Merchant Revenue" value={money(data.summary.totalRevenueCents)} sub={data.rangeLabel} />
            <MetricCard label="TrayLoop Fees" value={money(data.summary.platformFeeRevenueCents)} sub="Platform fee revenue" accent />
            <MetricCard label="Repeat Revenue" value={pct(data.summary.repeatRevenueSharePercent)} sub={money(data.summary.repeatRevenueCents)} />
            <MetricCard label="Upsell Lift" value={money(data.summary.upsellRevenueCents)} sub={`${data.summary.upsellAttachRatePercent}% attach`} />
            <MetricCard label="Active Merchants" value={data.summary.activeOrganizations} sub={`${data.summary.organizationsWithRevenue} with revenue`} />
            <MetricCard label="Concentration" value={pct(data.summary.topCustomerConcentration.top3Percent)} sub="Top 3 customer share" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 24 }}>
            <Panel title="Insights">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.insights.map((insight) => (
                  <div key={insight.id} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #EEEAE4', background: '#FAFAF9', fontSize: 13, lineHeight: 1.45, color: '#44403C' }}>
                    {insight.text}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Revenue trend">
              <div style={{ display: 'grid', gap: 8 }}>
                {data.trends.slice(-10).map((point) => (
                  <div key={point.date} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 70px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#78716C' }}>
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div style={{ background: '#EFEAE2', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(4, (point.totalRevenueCents / maxTrendRevenue) * 100)}%`, background: '#1C1917', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1917', textAlign: 'right' }}>{money(point.totalRevenueCents)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Panel title="Merchant health">
              <div style={{ display: 'grid', gap: 10 }}>
                <HealthRow label="Healthy" value={data.summary.orgHealthCounts.healthy} color="#166534" bg="#DCFCE7" />
                <HealthRow label="At risk" value={data.summary.orgHealthCounts.at_risk} color="#A16207" bg="#FEF3C7" />
                <HealthRow label="Dormant" value={data.summary.orgHealthCounts.dormant} color="#B91C1C" bg="#FEE2E2" />
                <HealthRow label="New" value={data.summary.orgHealthCounts.new} color="#1D4ED8" bg="#DBEAFE" />
              </div>
            </Panel>

            <Panel title="Priority opportunities">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.opportunities.slice(0, 4).map((opportunity) => (
                  <div key={opportunity.id} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #EEEAE4', background: '#FAFAF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{opportunity.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207', whiteSpace: 'nowrap' }}>{money(opportunity.estimatedRevenueCents)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.45 }}>{opportunity.description}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Merchant revenue table">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                    <Th>Merchant</Th>
                    <Th>Health</Th>
                    <Th>Revenue</Th>
                    <Th>TrayLoop Fees</Th>
                    <Th>Orders</Th>
                    <Th>Repeat Customers</Th>
                    <Th>Last Order</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.organizations.map((organization) => (
                    <tr key={organization.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                      <td style={{ padding: '10px 0', fontSize: 13, fontWeight: 600 }}>{organization.name}</td>
                      <td style={{ padding: '10px 0' }}>
                        <StatusPill status={organization.health} />
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{money(organization.totalRevenueCents)}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{money(organization.platformFeeRevenueCents)}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.orderCount}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.repeatCustomerCount}</td>
                      <td style={{ padding: '10px 0', fontSize: 12, color: '#78716C' }}>
                        {organization.lastOrderAt ? new Date(organization.lastOrderAt).toLocaleDateString() : 'No orders yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: boolean }) {
  return (
    <div style={{ borderRadius: 10, padding: '16px 18px', background: accent ? '#292524' : '#FFFFFF', border: accent ? 'none' : '1px solid #E7E5E4' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accent ? '#D4A853' : '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ? '#FAFAF9' : '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: accent ? '#D6D3D1' : '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

function HealthRow({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #EEEAE4' }}>
      <span style={{ fontSize: 13, color: '#1C1917', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '4px 8px', borderRadius: 999 }}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: 'healthy' | 'at_risk' | 'dormant' | 'new' }) {
  const config = {
    healthy: { bg: '#DCFCE7', color: '#166534', label: 'Healthy' },
    at_risk: { bg: '#FEF3C7', color: '#A16207', label: 'At risk' },
    dormant: { bg: '#FEE2E2', color: '#B91C1C', label: 'Dormant' },
    new: { bg: '#DBEAFE', color: '#1D4ED8', label: 'New' },
  }[status];

  return (
    <span style={{ fontSize: 11, fontWeight: 700, background: config.bg, color: config.color, padding: '4px 8px', borderRadius: 999 }}>
      {config.label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </th>
  );
}
