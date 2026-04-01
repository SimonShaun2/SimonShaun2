'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface OverviewData {
  summary: {
    mrr: number;
    paidRestaurants: number;
    trialRestaurants: number;
    gmvThisMonth: number;
    activeRestaurants: number;
    atRiskRevenue: number;
    projectedMrr: number;
  };
  restaurantsByGmv: Array<{
    id: string;
    name: string;
    slug: string;
    isPaid: boolean;
    orderCount: number;
    gmv: number;
  }>;
  mrrBreakdown: Array<{
    id: string;
    name: string;
    isPaid: boolean;
    mrr: number;
    label: string;
  }>;
  atRiskCustomers: Array<{
    customerId: string;
    name: string;
    company: string | null;
    orgName: string;
    orderCount: number;
    avgOrderValue: number;
    lastOrderAt: string;
    daysSinceLastOrder: number;
  }>;
  recentPayments: Array<{
    id: string;
    orgName: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

function cents(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function centsDecimal(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 13, color: '#78716C' }}>Loading platform data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Overview</h1>
        <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>
          {error || 'Failed to load overview data'}
        </div>
      </div>
    );
  }

  const { summary, restaurantsByGmv, mrrBreakdown, atRiskCustomers, recentPayments } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>
        Every restaurant, every dollar — your TrayLoop business at a glance
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        <KpiCard label="YOUR MRR" value={cents(summary.mrr)} sub={`${summary.paidRestaurants} paid · ${summary.trialRestaurants} trial`} accent />
        <KpiCard label="GMV THIS MONTH" value={cents(summary.gmvThisMonth)} sub="Through your platform" />
        <KpiCard label="ACTIVE RESTAURANTS" value={summary.activeRestaurants} sub={`${summary.trialRestaurants} trials to convert`} />
        <KpiCard label="AT-RISK REVENUE" value={cents(summary.atRiskRevenue)} sub={`${atRiskCustomers.length} customers lapsed`} warn={summary.atRiskRevenue > 0} />
        <KpiCard label="PROJECTED MRR" value={cents(summary.projectedMrr)} sub="If all trials convert" />
      </div>

      {/* Two-column: Restaurants by GMV + MRR Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Restaurants by GMV */}
        <Panel title="Restaurants by GMV" badge={`${restaurantsByGmv.length} active`}>
          {restaurantsByGmv.length === 0 ? (
            <EmptyState text="No restaurants yet" />
          ) : (
            restaurantsByGmv.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={r.name} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#78716C' }}>
                      <Badge paid={r.isPaid} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{cents(r.gmv)}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>{r.orderCount} orders</div>
                </div>
              </div>
            ))
          )}
        </Panel>

        {/* MRR Breakdown */}
        <Panel title="MRR Breakdown" badge={`${cents(summary.mrr)}/mo`}>
          {mrrBreakdown.length === 0 ? (
            <EmptyState text="No restaurants yet" />
          ) : (
            mrrBreakdown.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F4' }}>
                <div style={{ fontSize: 13, color: r.isPaid ? '#1C1917' : '#A8A29E' }}>
                  {r.name} {!r.isPaid && <span style={{ fontSize: 11 }}>(trial)</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: r.isPaid ? '#166534' : '#78716C' }}>
                  {r.label}
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      {/* At-Risk Customers */}
      <Panel title="At-Risk Customers" badge={atRiskCustomers.length > 0 ? `${cents(summary.atRiskRevenue)} at stake` : undefined} style={{ marginBottom: 28 }}>
        {atRiskCustomers.length === 0 ? (
          <EmptyState text="No at-risk customers detected" />
        ) : (
          atRiskCustomers.map((c) => (
            <div key={c.customerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#DC2626', background: '#FEF2F2',
                  borderRadius: 6, padding: '4px 8px', minWidth: 32, textAlign: 'center',
                }}>
                  {c.daysSinceLastOrder}d
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>
                    {c.orgName} · avg {cents(c.avgOrderValue)}/order
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </Panel>

      {/* Recent Payments */}
      <Panel title="Recent Payments" badge="Last 7 days">
        {recentPayments.length === 0 ? (
          <EmptyState text="No payments in the last 7 days" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                <Th>Restaurant</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{p.orgName}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: p.type === 'saas_sub' ? '#F3F4F6' : '#FEF3C7',
                      color: p.type === 'saas_sub' ? '#374151' : '#92400E',
                    }}>
                      {p.type === 'saas_sub' ? 'SaaS Sub' : 'Deposit'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0' }}>{centsDecimal(p.amount)}</td>
                  <td style={{ padding: '10px 0' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '10px 0', color: '#78716C', fontSize: 12 }}>
                    {new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

// --- Shared UI Components ---

function KpiCard({ label, value, sub, accent, warn }: { label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div style={{
      borderRadius: 10, padding: '18px 20px',
      background: accent ? '#292524' : '#FFFFFF',
      border: accent ? 'none' : '1px solid #E7E5E4',
    }}>
      <p style={{
        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
        marginTop: 0, marginBottom: 6,
        color: accent ? '#D4A853' : warn ? '#DC2626' : '#78716C',
      }}>{label}</p>
      <p style={{
        fontSize: 26, fontWeight: 700, margin: 0,
        color: accent ? '#FAFAF9' : warn ? '#DC2626' : '#1C1917',
      }}>{value}</p>
      {sub && (
        <p style={{
          fontSize: 11, margin: '4px 0 0',
          color: accent ? '#A8A29E' : '#A8A29E',
        }}>{sub}</p>
      )}
    </div>
  );
}

function Panel({ title, badge, children, style }: { title: string; badge?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
        {badge && <span style={{ fontSize: 12, color: '#78716C' }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: '#F5F5F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#78716C', flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ paid }: { paid: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
      background: paid ? '#DCFCE7' : '#FEF3C7',
      color: paid ? '#166534' : '#92400E',
    }}>
      {paid ? 'Paid' : 'Trial'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    succeeded: { bg: '#DCFCE7', text: '#166534' },
    paid: { bg: '#DCFCE7', text: '#166534' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    processing: { bg: '#DBEAFE', text: '#1E40AF' },
    failed: { bg: '#FEE2E2', text: '#991B1B' },
    refunded: { bg: '#F3F4F6', text: '#374151' },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: c.bg, color: c.text,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: '20px 0', margin: 0 }}>{text}</p>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600,
      color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{children}</th>
  );
}
