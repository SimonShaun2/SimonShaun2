'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchRevenueIntelligenceReport,
  trackRevenueInsightEvent,
  type MerchantRevenueIntelligenceReport,
} from '../../lib/api';
import LockedFeatureCard from '../../components/locked-feature-card';
import { useFeatureAccess } from '../../components/plan-access-provider';

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

export default function RevenueIntelligencePage() {
  const analyticsAccess = useFeatureAccess('analytics.advanced');
  const [range, setRange] = useState<'7d' | '30d' | 'mtd' | 'prev_month'>('30d');
  const [data, setData] = useState<MerchantRevenueIntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (analyticsAccess.loading || !analyticsAccess.enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    fetchRevenueIntelligenceReport(range)
      .then((next) => {
        if (!active) return;
        setData(next);
        trackRevenueInsightEvent({
          eventType: 'shown',
          itemType: 'report',
          itemKey: `report:${range}`,
          page: 'report',
          metadata: { range },
        }).catch(() => {});
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load revenue report');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [analyticsAccess.enabled, analyticsAccess.loading, range]);

  const maxTrendRevenue = useMemo(() => {
    if (!data?.trends?.length) return 1;
    return Math.max(...data.trends.map((point) => point.totalRevenueCents), 1);
  }, [data]);

  if (!analyticsAccess.loading && !analyticsAccess.enabled) {
    return (
      <LockedFeatureCard
        featureKey="analytics.advanced"
        title="Catering Revenue Report unlocks on Growth"
        description="Growth turns reporting into an action engine with AI insights, customer health, revenue mix, and at-risk opportunity tracking."
        bullets={[
          'See at-risk customers and dormant revenue clearly',
          'Track repeat vs new revenue mix over time',
          'Surface next-best growth actions from real data',
        ]}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
            Revenue Intelligence
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1C1917' }}>Catering revenue report</h1>
          <p style={{ fontSize: 13, color: '#78716C', margin: '6px 0 0' }}>
            See where catering revenue is coming from, which accounts need attention, and where average order value can grow.
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
        <div style={{ padding: 24, color: '#78716C', fontSize: 14 }}>Loading revenue report...</div>
      ) : error || !data ? (
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
          {error || 'Unable to load the revenue report.'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Revenue" value={money(data.summary.totalRevenueCents)} sub={data.rangeLabel} />
            <MetricCard label="Repeat revenue" value={pct(data.summary.repeatRevenueSharePercent)} sub={money(data.summary.repeatRevenueCents)} />
            <MetricCard label="New revenue" value={money(data.summary.newRevenueCents)} sub={`${data.summary.totalCustomerCount} customers`} />
            <MetricCard label="AOV" value={money(data.summary.avgOrderValueCents)} sub={`${data.summary.orderCount} finalized orders`} />
            <MetricCard label="Dormant value" value={money(data.summary.dormantRevenueCents)} sub="Recoverable average order value" />
            <MetricCard label="Upsell lift" value={money(data.summary.upsellRevenueCents)} sub={`${data.summary.upsellAttachRatePercent}% attach rate`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20 }}>
            <Panel title="Insights">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.insights.map((insight) => (
                  <div key={insight.id} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #EEEAE4', background: '#FAFAF9', fontSize: 13, color: '#44403C', lineHeight: 1.45 }}>
                    {insight.text}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Trend">
              <div style={{ display: 'grid', gap: 8 }}>
                {data.trends.slice(-10).map((point) => (
                  <div key={point.date} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 74px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#78716C' }}>
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div style={{ background: '#EFEAE2', height: 10, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(4, (point.totalRevenueCents / maxTrendRevenue) * 100)}%`, background: '#1C1917', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1917', textAlign: 'right' }}>{money(point.totalRevenueCents)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Panel title="Recommended next steps">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.recommendations.map((recommendation) => (
                  <a
                    key={recommendation.id}
                    href={recommendation.href}
                    onClick={() => {
                      trackRevenueInsightEvent({
                        eventType: 'actioned',
                        itemType: 'recommendation',
                        itemKey: recommendation.id,
                        page: 'report',
                        metadata: { range },
                      }).catch(() => {});
                    }}
                    style={{ display: 'block', padding: '12px 14px', borderRadius: 12, border: '1px solid #EEEAE4', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>{recommendation.title}</div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.45, marginBottom: 8 }}>{recommendation.description}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207' }}>{recommendation.cta}</div>
                  </a>
                ))}
              </div>
            </Panel>

            <Panel title="Top customer concentration">
              <div style={{ display: 'grid', gap: 10 }}>
                <ConcentrationRow label="Top 1 customer" value={data.summary.topCustomerConcentration.top1Percent} />
                <ConcentrationRow label="Top 3 customers" value={data.summary.topCustomerConcentration.top3Percent} />
                <ConcentrationRow label="Top 5 customers" value={data.summary.topCustomerConcentration.top5Percent} />
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>
                Higher concentration makes a few customer relationships disproportionately important. Use this to spot dependency risk early.
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Priority opportunities">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.opportunities.map((opportunity) => (
                  <div key={opportunity.id} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #EEEAE4', background: '#FAFAF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{opportunity.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207', whiteSpace: 'nowrap' }}>{money(opportunity.estimatedRevenueCents)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.45, marginBottom: 8 }}>{opportunity.description}</div>
                    <a href={opportunity.action.href} style={{ fontSize: 12, fontWeight: 700, color: '#A16207', textDecoration: 'none' }}>
                      {opportunity.action.label}
                    </a>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Customer health">
              <div style={{ display: 'grid', gap: 10 }}>
                {data.customerHealth.map((customer) => (
                  <div key={customer.customerId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid #F5F5F4' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{customer.name}</div>
                      <div style={{ fontSize: 12, color: '#78716C' }}>
                        {customer.orderCount} orders · {money(customer.totalRevenueCents)} lifetime
                      </div>
                    </div>
                    <span
                      style={{
                        alignSelf: 'flex-start',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: '5px 8px',
                        background:
                          customer.segment === 'dormant' ? '#FEF2F2' :
                          customer.segment === 'at_risk' ? '#FEF3C7' :
                          customer.segment === 'growth_opportunity' ? '#DBEAFE' : '#DCFCE7',
                        color:
                          customer.segment === 'dormant' ? '#B91C1C' :
                          customer.segment === 'at_risk' ? '#A16207' :
                          customer.segment === 'growth_opportunity' ? '#1D4ED8' : '#166534',
                      }}
                    >
                      {customer.segment.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 14, background: '#FFFFFF', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  );
}

function ConcentrationRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#57534E' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1917' }}>{pct(value)}</span>
      </div>
      <div style={{ background: '#EFEAE2', borderRadius: 999, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(4, value)}%`, background: '#1C1917', height: '100%' }} />
      </div>
    </div>
  );
}
