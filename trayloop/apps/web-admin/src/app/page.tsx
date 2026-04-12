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
  serviceModeBreakdown: Array<{
    serviceType: string;
    label: string;
    orderCount: number;
    revenue: number;
  }>;
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
  return `$${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function centsDecimal(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
        <div
          style={{
            padding: 24,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            fontSize: 14,
            color: '#DC2626',
          }}
        >
          {error || 'Failed to load overview data'}
        </div>
      </div>
    );
  }

  const { summary, serviceModeBreakdown, restaurantsByGmv, mrrBreakdown, atRiskCustomers, recentPayments } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>
        Every restaurant, every dollar - your TrayLoop business at a glance
      </p>

      <div
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: 16,
          background: '#FFFFFF',
          padding: '16px 18px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4A853' }}>
            Operator desk
          </div>
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: '#1C1917' }}>
            Open merchant support workspaces from one place
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
            Jump straight into menu edits, launch setup, and storefront review without hunting through separate tools.
          </div>
        </div>
        <a
          href="/organizations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderRadius: 12,
            background: '#1C1917',
            color: '#FAFAF9',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Open support desk
        </a>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <KpiCard
          label="YOUR MRR"
          value={cents(summary.mrr)}
          sub={`${summary.paidRestaurants} paid - ${summary.trialRestaurants} trial`}
          accent
        />
        <KpiCard label="GMV THIS MONTH" value={cents(summary.gmvThisMonth)} sub="Through your platform" />
        <KpiCard
          label="ACTIVE RESTAURANTS"
          value={summary.activeRestaurants}
          sub={`${summary.trialRestaurants} trials to convert`}
        />
        <KpiCard
          label="AT-RISK REVENUE"
          value={cents(summary.atRiskRevenue)}
          sub={`${atRiskCustomers.length} customers lapsed`}
          warn={summary.atRiskRevenue > 0}
        />
        <KpiCard label="PROJECTED MRR" value={cents(summary.projectedMrr)} sub="If all trials convert" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <Panel title="Restaurants by GMV" badge={`${restaurantsByGmv.length} active`}>
          {restaurantsByGmv.length === 0 ? (
            <EmptyState text="No restaurants yet" />
          ) : (
            restaurantsByGmv.map((restaurant) => (
              <div
                key={restaurant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #F5F5F4',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={restaurant.name} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{restaurant.name}</div>
                    <div style={{ fontSize: 11, color: '#78716C' }}>
                      <Badge paid={restaurant.isPaid} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{cents(restaurant.gmv)}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>{restaurant.orderCount} orders</div>
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel title="MRR Breakdown" badge={`${cents(summary.mrr)}/mo`}>
          {mrrBreakdown.length === 0 ? (
            <EmptyState text="No restaurants yet" />
          ) : (
            mrrBreakdown.map((restaurant) => (
              <div
                key={restaurant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #F5F5F4',
                }}
              >
                <div style={{ fontSize: 13, color: restaurant.isPaid ? '#1C1917' : '#A8A29E' }}>
                  {restaurant.name} {!restaurant.isPaid && <span style={{ fontSize: 11 }}>(trial)</span>}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: restaurant.isPaid ? '#166534' : '#78716C',
                  }}
                >
                  {restaurant.label}
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel
        title="At-Risk Customers"
        badge={atRiskCustomers.length > 0 ? `${cents(summary.atRiskRevenue)} at stake` : undefined}
        style={{ marginBottom: 28 }}
      >
        {atRiskCustomers.length === 0 ? (
          <EmptyState text="No at-risk customers detected" />
        ) : (
          atRiskCustomers.map((customer) => (
            <div
              key={customer.customerId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #F5F5F4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#DC2626',
                    background: '#FEF2F2',
                    borderRadius: 6,
                    padding: '4px 8px',
                    minWidth: 32,
                    textAlign: 'center',
                  }}
                >
                  {customer.daysSinceLastOrder}d
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>
                    {customer.orgName} - avg {cents(customer.avgOrderValue)}/order
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </Panel>

      <Panel title="Revenue by Service Mode" badge="Month to date" style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {serviceModeBreakdown.map((mode) => (
            <div
              key={mode.serviceType}
              style={{
                border: '1px solid #E7E5E4',
                borderRadius: 10,
                background: '#FAFAF9',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#78716C',
                  marginBottom: 6,
                }}
              >
                {mode.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1917' }}>{cents(mode.revenue)}</div>
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>
                {mode.orderCount} {mode.orderCount === 1 ? 'order' : 'orders'}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Recent Payments" badge="Last 7 days">
        {recentPayments.length === 0 ? (
          <EmptyState text="No payments in the last 7 days" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 13 }}>
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
                {recentPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '10px 0', fontWeight: 500 }}>{payment.orgName}</td>
                    <td style={{ padding: '10px 0' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: payment.type === 'payment' ? '#F3F4F6' : '#FEF3C7',
                          color: payment.type === 'payment' ? '#374151' : '#92400E',
                        }}
                      >
                        {payment.type === 'payment' ? 'Payment' : 'Deposit'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 0' }}>{centsDecimal(payment.amount)}</td>
                    <td style={{ padding: '10px 0' }}>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td style={{ padding: '10px 0', color: '#78716C', fontSize: 12 }}>
                      {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        padding: '18px 20px',
        background: accent ? '#292524' : '#FFFFFF',
        border: accent ? 'none' : '1px solid #E7E5E4',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginTop: 0,
          marginBottom: 6,
          color: accent ? '#D4A853' : warn ? '#DC2626' : '#78716C',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          color: accent ? '#FAFAF9' : warn ? '#DC2626' : '#1C1917',
        }}
      >
        {value}
      </p>
      {sub ? (
        <p style={{ fontSize: 11, margin: '4px 0 0', color: '#A8A29E' }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  badge,
  children,
  style,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 10,
        background: '#FFFFFF',
        padding: '20px 24px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
        {badge ? <span style={{ fontSize: 12, color: '#78716C' }}>{badge}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#F5F5F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#78716C',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ paid }: { paid: boolean }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 4,
        background: paid ? '#DCFCE7' : '#FEF3C7',
        color: paid ? '#166534' : '#92400E',
      }}
    >
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
  const color = colors[status] ?? colors.pending;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        background: color.bg,
        color: color.text,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: '20px 0', margin: 0 }}>
      {text}
    </p>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: '8px 0',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 600,
        color: '#78716C',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </th>
  );
}
