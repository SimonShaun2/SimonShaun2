'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchRevenueIntelligenceSummary,
  trackRevenueInsightEvent,
  type MerchantRevenueIntelligenceSummary,
} from '../lib/api';
import LockedFeatureCard from './locked-feature-card';
import { useFeatureAccess } from './plan-access-provider';

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function pct(value: number) {
  return `${value}%`;
}

const RANGE_OPTIONS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'mtd', label: 'MTD' },
  { value: 'prev_month', label: 'Prev Month' },
] as const;

export default function RevenueIntelligencePanel() {
  const analyticsAccess = useFeatureAccess('analytics.advanced');
  const [range, setRange] = useState<'7d' | '30d' | 'mtd' | 'prev_month'>('30d');
  const [data, setData] = useState<MerchantRevenueIntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasTrackedShown = useRef(false);

  useEffect(() => {
    if (analyticsAccess.loading || !analyticsAccess.enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    fetchRevenueIntelligenceSummary(range)
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
  }, [analyticsAccess.enabled, analyticsAccess.loading, range]);

  useEffect(() => {
    if (!analyticsAccess.enabled || !data || hasTrackedShown.current) return;
    hasTrackedShown.current = true;
    trackRevenueInsightEvent({
      eventType: 'shown',
      itemType: 'report',
      itemKey: `dashboard:${data.range}`,
      page: 'dashboard',
      metadata: { range: data.range },
    }).catch(() => {});
  }, [data]);

  const maxTrendRevenue = useMemo(() => {
    if (!data?.trends?.length) return 1;
    return Math.max(...data.trends.map((point) => point.totalRevenueCents), 1);
  }, [data]);

  const handleRecommendationClick = (recommendationId: string) => {
    trackRevenueInsightEvent({
      eventType: 'clicked',
      itemType: 'recommendation',
      itemKey: recommendationId,
      page: 'dashboard',
      metadata: { range },
    }).catch(() => {});
  };

  if (!analyticsAccess.loading && !analyticsAccess.enabled) {
    return (
      <div style={{ marginBottom: 24 }}>
        <LockedFeatureCard
          compact
          featureKey="analytics.advanced"
          title="Advanced revenue intelligence unlocks on Engine"
          description="Launch and Momentum keep the operational basics. Engine adds AI insights, customer health, at-risk revenue signals, and deeper revenue analysis."
          bullets={[
            'Spot at-risk catering accounts before they churn',
            'See repeat vs new revenue mix and customer health',
            'Turn analytics into concrete next actions',
          ]}
        />
      </div>
    );
  }

  return (
    <section
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 16,
        background: '#FFFFFF',
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
            Revenue Intelligence
          </div>
          <h2 style={{ margin: 0, fontSize: 22, color: '#1C1917' }}>What happened and what to do next</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#78716C' }}>
            See repeat revenue, concentration risk, upsell lift, and the next catering actions worth taking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RANGE_OPTIONS.map((option) => {
            const active = option.value === range;
            return (
              <button
                key={option.value}
                onClick={() => {
                  hasTrackedShown.current = false;
                  setRange(option.value);
                }}
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
        <div style={{ padding: '18px 0', color: '#78716C', fontSize: 14 }}>Loading revenue intelligence...</div>
      ) : error || !data ? (
        <div style={{ padding: 16, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13 }}>
          {error || 'Unable to load revenue intelligence right now.'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
            <MetricCard label="Revenue" value={money(data.summary.totalRevenueCents)} sub={data.rangeLabel} />
            <MetricCard label="Repeat Revenue" value={pct(data.summary.repeatRevenueSharePercent)} sub={money(data.summary.repeatRevenueCents)} />
            <MetricCard label="Avg Order Value" value={money(data.summary.avgOrderValueCents)} sub={`${data.summary.orderCount} orders`} />
            <MetricCard label="Upsell Lift" value={money(data.summary.upsellRevenueCents)} sub={`${data.summary.upsellAttachRatePercent}% attach rate`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 18 }}>
            <div style={{ border: '1px solid #F1EFEC', borderRadius: 14, background: '#FAFAF9', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>AI Insights</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {data.insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} style={{ padding: '12px 14px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #EEEAE4', fontSize: 13, color: '#44403C', lineHeight: 1.45 }}>
                    {insight.text}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid #F1EFEC', borderRadius: 14, background: '#FAFAF9', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>Trend</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {data.trends.slice(-8).map((point) => (
                  <div key={point.date} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 70px', gap: 10, alignItems: 'center' }}>
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
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ border: '1px solid #F1EFEC', borderRadius: 14, background: '#FFFFFF', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>Priority Actions</div>
                <a href="/revenue-intelligence" style={{ fontSize: 12, fontWeight: 700, color: '#A16207', textDecoration: 'none' }}>
                  Open full report
                </a>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {data.recommendations.slice(0, 3).map((recommendation) => (
                  <a
                    key={recommendation.id}
                    href={recommendation.href}
                    onClick={() => handleRecommendationClick(recommendation.id)}
                    style={{
                      display: 'block',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid #EEEAE4',
                      background: '#FAFAF9',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>{recommendation.title}</div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.45, marginBottom: 8 }}>{recommendation.description}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A16207' }}>{recommendation.cta}</div>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid #F1EFEC', borderRadius: 14, background: '#FFFFFF', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 10 }}>Customer Health</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {data.customerHealth.slice(0, 4).map((customer) => (
                  <div key={customer.customerId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid #F5F5F4' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{customer.name}</div>
                      <div style={{ fontSize: 12, color: '#78716C' }}>
                        {customer.orderCount} orders · {money(customer.avgOrderValueCents)} avg
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
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 14, padding: '14px 16px', background: '#FAFAF9' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}
