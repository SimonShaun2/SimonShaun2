'use client';

import { useEffect, useMemo, useState } from 'react';
import AutomationEnginePanel, { type SummaryMetric } from '../../components/automation-engine-panel';
import AiCampaignSuggestionsPanel, { type AiSalesSuggestion } from '../../components/ai-campaign-suggestions-panel';
import { fetchMerchantCustomers, fetchMerchantFollowUps, type MerchantCustomerSummary } from '../../lib/api';
import { hasMerchantSession } from '../../lib/session';
import { formatCurrency } from '../../lib/format';

function daysSince(dateString: string | null) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
}

function avgOrderValue(customer: MerchantCustomerSummary) {
  return customer.orderCount > 0 ? customer.totalSpend / customer.orderCount : 0;
}

export default function AutomationsPage() {
  const [customers, setCustomers] = useState<MerchantCustomerSummary[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasMerchantSession()) {
      window.location.href = '/login';
      return;
    }

    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [followUpResult, customerRows] = await Promise.all([
        fetchMerchantFollowUps({ pageSize: 100 }),
        fetchMerchantCustomers(),
      ]);
      setPendingFollowUps(followUpResult.data.filter((item) => item.status === 'pending').length);
      setCustomers(customerRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }

  const derived = useMemo(() => {
    const reorderReady = customers.filter((customer) => {
      const age = daysSince(customer.lastOrderDate);
      return customer.orderCount > 1 && age >= 21 && age <= 60;
    });
    const dormant = customers.filter((customer) => daysSince(customer.lastOrderDate) >= 90);
    const vipAtRisk = customers.filter((customer) => customer.totalSpend >= 100_000 && daysSince(customer.lastOrderDate) >= 45);
    const warmCustomers = customers.filter((customer) => {
      const age = daysSince(customer.lastOrderDate);
      return customer.orderCount > 0 && age < 21;
    });

    const reorderPotential = reorderReady.reduce((sum, customer) => sum + avgOrderValue(customer) * 0.22, 0);
    const reactivationPotential = dormant.reduce((sum, customer) => sum + avgOrderValue(customer) * 0.14, 0);
    const vipPotential = vipAtRisk.reduce((sum, customer) => sum + avgOrderValue(customer) * 0.3, 0);

    const campaigns: AiSalesSuggestion[] = [
      {
        id: 'reorder-reminder',
        title: 'Reorder reminder sequence',
        audience: 'Repeat customers who are 21-60 days from their last order.',
        reason: 'These customers already know how to buy from you. A gentle reminder usually wins the fastest revenue.',
        summary: 'Build a short reminder sequence that nudges repeat buyers before they go cold.',
        targetCount: reorderReady.length,
        estimatedRevenueCents: Math.round(reorderPotential),
        confidence: 'high',
        tags: ['Reorder', 'Repeat', 'Fast win'],
        locked: true,
        inspectHref: '/follow-ups',
        inspectLabel: 'Review reminder queue',
      },
      {
        id: 'reactivation-winback',
        title: 'Dormant customer win-back',
        audience: 'Customers who have been quiet for 90+ days and still have spend history.',
        reason: 'These accounts already have trust and order history, which makes reactivation much cheaper than acquisition.',
        summary: 'Create a reactivation campaign with a warm, direct offer and a clear next step.',
        targetCount: dormant.length,
        estimatedRevenueCents: Math.round(reactivationPotential),
        confidence: 'high',
        tags: ['Win-back', 'Dormant', 'AI draft'],
        locked: true,
        inspectHref: '/customers',
        inspectLabel: 'Inspect dormant list',
      },
      {
        id: 'vip-rescue',
        title: 'High-value rescue campaign',
        audience: 'VIP accounts with strong spend but slowing cadence.',
        reason: 'A premium touchpoint can recover a high-value account before it drops out of the buying cycle.',
        summary: 'Use a more personal tone, a stronger offer, and a tighter send window for top accounts.',
        targetCount: vipAtRisk.length,
        estimatedRevenueCents: Math.round(vipPotential),
        confidence: 'medium',
        tags: ['VIP', 'Retention', 'Priority'],
        locked: true,
        inspectHref: '/customers',
        inspectLabel: 'Review VIP accounts',
      },
    ];

    return {
      reorderReady,
      dormant,
      vipAtRisk,
      warmCustomers,
      campaigns,
      estimatedPipeline: reorderPotential + reactivationPotential + vipPotential,
    };
  }, [customers]);

  const summaryMetrics: SummaryMetric[] = [
    {
      label: 'Campaigns',
      value: String(derived.campaigns.length),
      note: 'AI-drafted plays waiting for Engine',
      tone: 'accent',
    },
    {
      label: 'Reorder-ready',
      value: String(derived.reorderReady.length),
      note: 'Repeat customers with fresh intent',
      tone: 'good',
    },
    {
      label: 'Dormant',
      value: String(derived.dormant.length),
      note: 'Win-back candidates',
      tone: 'warning',
    },
    {
      label: 'Pipeline',
      value: formatCurrency(derived.estimatedPipeline),
      note: 'Estimated recoverable value',
      tone: 'neutral',
    },
  ];

  const lockBullets = [
    'Auto-send is locked until Engine is enabled.',
    'Scheduling, throttles, and splits are not active yet.',
    'Drafts and audience inspection are available now.',
  ];

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <AutomationEnginePanel
        eyebrow="AI campaign engine"
        title="Retention plays, drafted from your own customers"
        description="The engine watches order cadence, spotlights dormant customers, and packages the right campaign idea for each segment. You can inspect the audience and copy the brief now, then unlock execution when Engine is available."
        metrics={summaryMetrics}
        primaryAction={{ label: 'Launch Engine', href: '/settings', locked: true }}
        secondaryAction={{ label: 'Open follow-ups', href: '/follow-ups' }}
        status={{
          label: 'Engine locked',
          note: 'Campaign generation and execution are staged. Drafts are ready, but send and scheduling remain disabled until Engine is enabled.',
          tone: 'warning',
        }}
        blockers={lockBullets}
      />

      {error ? (
        <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', borderRadius: 16, padding: '14px 16px', fontSize: 14 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div>
          {loading ? (
            <div
              style={{
                border: '1px solid #E7E5E4',
                borderRadius: 28,
                background: '#FFFFFF',
                padding: 40,
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: 14,
              }}
            >
              Loading campaign engine...
            </div>
          ) : (
            <AiCampaignSuggestionsPanel
              eyebrow="Suggested campaigns"
              title="AI-drafted plays that are ready to launch"
              description="Each suggestion is built from cadence, spend, and recency patterns. Copy the brief now, inspect the audience, and keep the send path locked until Engine is enabled."
              metrics={[
                {
                  label: 'Warm',
                  value: String(derived.warmCustomers.length),
                  note: 'Recently active customers',
                },
                {
                  label: 'Reorder-ready',
                  value: String(derived.reorderReady.length),
                  note: 'Fastest conversion pool',
                },
                {
                  label: 'Dormant',
                  value: String(derived.dormant.length),
                  note: 'Best win-back candidates',
                },
                {
                  label: 'Pending follow-ups',
                  value: String(pendingFollowUps),
                  note: 'Manual queue that feeds the engine',
                },
              ]}
              suggestions={derived.campaigns}
              engineRequiredLabel="Engine required"
              engineRequiredNote="Unlock Engine to automate sends, apply timing windows, and move these drafts from preview into real campaigns."
            />
          )}
        </div>

        <aside style={{ display: 'grid', gap: 14, position: 'sticky', top: 24 }}>
          <div
            style={{
              border: '1px solid #E7E5E4',
              borderRadius: 24,
              background: '#FFFFFF',
              padding: 18,
              boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', fontWeight: 800 }}>
              Audience slices
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {[
                {
                  label: 'Reorder-ready',
                  count: derived.reorderReady.length,
                  note: '21-60 day repeat buyers',
                  color: '#166534',
                  bg: '#ECFDF5',
                },
                {
                  label: 'Dormant',
                  count: derived.dormant.length,
                  note: '90+ day win-back targets',
                  color: '#92400E',
                  bg: '#FFFBEB',
                },
                {
                  label: 'VIP at risk',
                  count: derived.vipAtRisk.length,
                  note: 'High spend, slowing cadence',
                  color: '#C2410C',
                  bg: '#FFF7ED',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 18,
                    border: '1px solid #E7E5E4',
                    background: item.bg,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{item.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1C1917' }}>{item.count}</div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #E7E5E4',
              borderRadius: 24,
              background: '#FFFFFF',
              padding: 18,
              boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', fontWeight: 800 }}>
              Engine lock
            </div>
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Send path is staged
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#78716C', lineHeight: 1.7 }}>
              We’re intentionally keeping execution disabled so operators can inspect audiences without risking accidental sends.
            </p>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {['Copy brief', 'Inspect audience', 'Review follow-ups', 'Enable Engine'].map((step, index) => (
                <div
                  key={step}
                  style={{
                    borderRadius: 16,
                    border: '1px solid #E7E5E4',
                    background: index === 3 ? '#FEF3C7' : '#FAFAF9',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{step}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: index === 3 ? '#92400E' : '#A8A29E', textTransform: 'uppercase' }}>
                    {index === 3 ? 'Locked' : 'Ready'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
