'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface ForecastData {
  summary: { projectedGmv30d: number; recurringClients: number; projectedMrr: number };
  recurringCustomers: Array<{
    customerId: string;
    name: string;
    company: string | null;
    orgName: string;
    orderCount: number;
    avgOrderValue: number;
    ordersPerMonth: number;
    projectedMonthly: number;
    nextExpectedOrder: string;
  }>;
}

function cents(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function RevenueForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/revenue-forecast')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const highestProjected = useMemo(() => {
    if (!data?.recurringCustomers.length) return null;
    return [...data.recurringCustomers].sort((a, b) => b.projectedMonthly - a.projectedMonthly)[0] ?? null;
  }, [data]);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 0, marginBottom: 6 }}>Revenue Forecast</h1>
        <p style={{ color: '#78716C', fontSize: 14 }}>Loading forecast intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 0, marginBottom: 6 }}>Revenue Forecast</h1>
        <div style={{ padding: 20, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, fontSize: 14, color: '#B91C1C' }}>
          {error || 'Unable to load forecast intelligence.'}
        </div>
      </div>
    );
  }

  const { summary, recurringCustomers } = data;

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <section
        style={{
          borderRadius: 22,
          padding: 24,
          background: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
          color: '#F0FDFA',
          display: 'grid',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CCFBF1', marginBottom: 8 }}>
              Corporate Growth Intelligence
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>Forecast repeat revenue before the month closes.</h1>
            <p style={{ fontSize: 14, color: '#CCFBF1', lineHeight: 1.7, margin: '10px 0 0' }}>
              This view turns recurring behavior into a real revenue map: who is likely to reorder, how much monthly demand is forming,
              and which customer patterns the team should lean into harder.
            </p>
          </div>
          <div
            style={{
              minWidth: 260,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: 18,
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CCFBF1', marginBottom: 8 }}>
              Strongest signal
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>
              {highestProjected ? `${highestProjected.name} is the best current repeat-revenue pattern.` : 'No repeat pattern is strong enough to forecast yet.'}
            </div>
            <div style={{ fontSize: 13, color: '#CCFBF1', lineHeight: 1.6, marginTop: 10 }}>
              Use this to decide which merchant segments or customer profiles deserve more campaign budget and more human follow-up.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <MetricCard label="Projected GMV (30d)" value={cents(summary.projectedGmv30d)} sub="Modeled from recurring and recurring-like demand" />
          <MetricCard label="Recurring clients" value={String(summary.recurringClients)} sub="Accounts driving repeat order cadence" />
          <MetricCard label="Projected MRR" value={cents(summary.projectedMrr)} sub="If current subscription base holds" />
          <MetricCard
            label="Highest forecast account"
            value={highestProjected ? cents(highestProjected.projectedMonthly) : '--'}
            sub={highestProjected ? `${highestProjected.name} • ${highestProjected.ordersPerMonth.toFixed(1)} orders/month` : 'Waiting for stronger repeat pattern'}
          />
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
        <Panel title="Recurring demand table" eyebrow="Accounts creating the most predictable repeat revenue">
          {recurringCustomers.length === 0 ? (
            <EmptyState text="No recurring clients detected yet." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {recurringCustomers.map((customer) => (
                <div
                  key={customer.customerId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.7fr',
                    gap: 14,
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid #E7E5E4',
                    background: '#FFFFFF',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{customer.name}</div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55 }}>
                      {customer.company ? `${customer.company} • ` : ''}{customer.orgName}
                    </div>
                    <div style={{ fontSize: 12, color: '#78716C', lineHeight: 1.55 }}>
                      Next expected {new Date(customer.nextExpectedOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <ForecastMetric label="Projected monthly" value={cents(customer.projectedMonthly)} />
                  <ForecastMetric label="Average order" value={cents(customer.avgOrderValue)} />
                  <ForecastMetric label="Orders / mo" value={customer.ordersPerMonth.toFixed(1)} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Corporate playbook" eyebrow="How to use this forecast">
          <div style={{ display: 'grid', gap: 10 }}>
            <PlaybookCard
              label="Best-fit verticals"
              text="Look for merchants whose strongest repeat clients cluster around office lunches, recurring events, or high-frequency corporate ordering."
            />
            <PlaybookCard
              label="Who to campaign first"
              text="If a customer’s projected monthly value is rising, they should move into AI reorder reminders before they drift back to manual ordering."
            />
            <PlaybookCard
              label="What to scale"
              text="Use the highest-projected accounts as the model for packaging, pricing, and the segments Growth Advisor should target next."
            />
          </div>
        </Panel>
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
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F766E', marginBottom: 8 }}>
          {eyebrow}
        </div>
      ) : null}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: '#1C1917' }}>{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CCFBF1', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#F0FDFA' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#CCFBF1', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function ForecastMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{value}</div>
    </div>
  );
}

function PlaybookCard({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ borderRadius: 14, border: '1px solid #E7E5E4', background: '#FAFAF9', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F766E', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{text}</div>;
}
