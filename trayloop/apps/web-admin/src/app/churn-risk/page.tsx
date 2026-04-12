'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface ChurnData {
  summary: { atRiskRestaurants: number; mrrAtRisk: number; atRiskCustomers: number };
  restaurants: Array<{
    id: string;
    name: string;
    isPaid: boolean;
    ownerName: string | null;
    ordersThisMonth: number;
    lastOrderAt: string | null;
    daysSinceLastOrder: number | null;
    risk: 'high' | 'medium';
  }>;
  customers: Array<{
    customerId: string;
    name: string;
    company: string | null;
    orgName: string;
    orderCount: number;
    avgOrderValue: number;
    lastOrderAt: string;
    daysSinceLastOrder: number;
  }>;
}

function cents(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function shortDate(value: string | null): string {
  if (!value) return 'No recent order';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChurnRiskPage() {
  const [data, setData] = useState<ChurnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/churn-risk')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const recoveryPlaybook = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'High-risk restaurants',
        value: String(data.restaurants.filter((restaurant) => restaurant.risk === 'high').length),
        detail: 'Move these merchants into launch support or outreach this week.',
      },
      {
        label: 'Dormant customer value',
        value: cents(data.customers.reduce((sum, customer) => sum + customer.avgOrderValue, 0)),
        detail: 'Average order value available for reactivation across lapsed accounts.',
      },
      {
        label: 'Fastest save motion',
        value: data.customers.length > 0 ? 'Re-engage repeat buyers' : 'No immediate saves',
        detail: 'The AI campaign engine should start with overdue repeat customers first.',
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 0, marginBottom: 6 }}>Churn Risk</h1>
        <p style={{ color: '#78716C', fontSize: 14 }}>Loading churn intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 0, marginBottom: 6 }}>Churn Risk</h1>
        <div style={{ padding: 20, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, fontSize: 14, color: '#B91C1C' }}>
          {error || 'Unable to load churn intelligence.'}
        </div>
      </div>
    );
  }

  const { summary, restaurants, customers } = data;

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <section
        style={{
          borderRadius: 22,
          padding: 24,
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
          color: '#FAFAF9',
          display: 'grid',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
              Retention Operating System
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>See where revenue is starting to slip before the merchant feels it.</h1>
            <p style={{ fontSize: 14, color: '#E7E5E4', lineHeight: 1.7, margin: '10px 0 0' }}>
              This view is the internal save queue. It highlights merchants going cold, customer revenue drifting out of cycle,
              and where the team should push reactivation or hands-on support next.
            </p>
          </div>
          <div
            style={{
              minWidth: 260,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 18,
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
              This week&apos;s priority
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>
              {summary.atRiskRestaurants > 0
                ? 'Recover at-risk restaurants before they stall into churn.'
                : 'No merchant churn fire right now. Focus on reactivating customers.'}
            </div>
            <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6, marginTop: 10 }}>
              Pair launch coaching with AI re-engagement on the accounts below to protect repeat revenue while relationships are still warm.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <SummaryCard label="At-risk restaurants" value={String(summary.atRiskRestaurants)} sub="Needs merchant-side intervention" accent="danger" />
          <SummaryCard label="MRR at risk" value={cents(summary.mrrAtRisk)} sub="Subscription revenue tied to cold activity" accent="danger" />
          <SummaryCard label="Lapsed customers" value={String(summary.atRiskCustomers)} sub="Repeat buyers worth reactivation" accent="warning" />
          <SummaryCard
            label="Reactivation value"
            value={cents(customers.reduce((sum, customer) => sum + customer.avgOrderValue, 0))}
            sub="Combined average order value in the save queue"
            accent="neutral"
          />
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 18 }}>
        <Panel title="Merchant rescue queue" eyebrow="Restaurants most likely to slide backward">
          {restaurants.length === 0 ? (
            <EmptyState text="No merchants are trending toward churn right now." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: restaurant.risk === 'high' ? '1px solid #FCA5A5' : '1px solid #FDE68A',
                    background: restaurant.risk === 'high' ? '#FFF7F7' : '#FFFBEB',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: restaurant.risk === 'high' ? '#B91C1C' : '#A16207' }}>
                      {restaurant.daysSinceLastOrder ?? '--'}
                    </div>
                    <div style={{ fontSize: 11, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>days idle</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{restaurant.name}</div>
                      <RiskBadge risk={restaurant.risk} />
                      <PlanBadge paid={restaurant.isPaid} />
                    </div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>
                      {restaurant.ownerName ?? 'No owner assigned'} • {restaurant.ordersThisMonth} orders this month • last order {shortDate(restaurant.lastOrderAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#57534E', maxWidth: 180 }}>
                    {restaurant.risk === 'high'
                      ? 'Urgent: pair human outreach with a retention campaign.'
                      : 'Monitor closely: a follow-up campaign should go out next.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Recovery playbook" eyebrow="What the team should do next">
          <div style={{ display: 'grid', gap: 10 }}>
            {recoveryPlaybook.map((item) => (
              <div key={item.label} style={{ border: '1px solid #EEEAE4', borderRadius: 14, padding: '14px 16px', background: '#FAFAF9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#A16207', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1C1917', marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section style={{ display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
            Customer save queue
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#1C1917' }}>Customers worth winning back now</h2>
        </div>

        {customers.length === 0 ? (
          <Panel title="No lapsed repeat customers">
            <EmptyState text="The current customer base is healthy. This is a good moment to push growth instead of rescue." />
          </Panel>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {customers.map((customer) => (
              <div
                key={customer.customerId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '76px 1.2fr 0.9fr 0.8fr',
                  gap: 14,
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid #EEEAE4',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#B91C1C' }}>{customer.daysSinceLastOrder}</div>
                  <div style={{ fontSize: 11, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>days idle</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{customer.name}</div>
                  <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>
                    {customer.company ? `${customer.company} • ` : ''}{customer.orgName}
                  </div>
                  <div style={{ fontSize: 12, color: '#78716C', lineHeight: 1.55 }}>
                    Last order {shortDate(customer.lastOrderAt)} • {customer.orderCount} orders total
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A16207', marginBottom: 4 }}>
                    Average order value
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{cents(customer.avgOrderValue)}</div>
                </div>
                <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>
                  Best next motion: send a reactivation message with a clear reorder offer and a low-friction date prompt.
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 18, background: '#FFFFFF', padding: '20px 22px' }}>
      {eyebrow ? (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A16207', marginBottom: 8 }}>
          {eyebrow}
        </div>
      ) : null}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: '#1C1917' }}>{title}</h2>
      {children}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'danger' | 'warning' | 'neutral';
}) {
  const palette =
    accent === 'danger'
      ? { background: '#FFF7F7', border: '#FCA5A5', value: '#B91C1C', label: '#991B1B' }
      : accent === 'warning'
        ? { background: '#FFFBEB', border: '#FDE68A', value: '#A16207', label: '#A16207' }
        : { background: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', value: '#FAFAF9', label: '#D4A853' };

  return (
    <div style={{ borderRadius: 16, padding: '16px 18px', border: `1px solid ${palette.border}`, background: palette.background }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.label, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: palette.value }}>{value}</div>
      <div style={{ fontSize: 12, color: accent === 'neutral' ? '#D6D3D1' : '#57534E', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: 'high' | 'medium' }) {
  return (
    <span
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 700,
        background: risk === 'high' ? '#FEE2E2' : '#FEF3C7',
        color: risk === 'high' ? '#991B1B' : '#A16207',
      }}
    >
      {risk === 'high' ? 'High risk' : 'Medium risk'}
    </span>
  );
}

function PlanBadge({ paid }: { paid: boolean }) {
  return (
    <span
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 700,
        background: paid ? '#DCFCE7' : '#DBEAFE',
        color: paid ? '#166534' : '#1D4ED8',
      }}
    >
      {paid ? 'Paid merchant' : 'Trial merchant'}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{text}</div>;
}
