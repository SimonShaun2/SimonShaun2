'use client';

import { useEffect, useState } from 'react';
import {
  createBillingCheckout,
  fetchBillingSubscription,
  generateGrowthAdvisor,
  type MerchantBillingSubscription,
  type GrowthAdvisorPlan,
  type GrowthAdvisorResult,
  type GrowthAdvisorSnapshot,
} from '../../lib/api';
import { growthAdvisorEnabled } from '../../lib/features';

const PROMPT_IDEAS = [
  'We are new to catering and need our first 3 offers.',
  'We get inquiries, but our average order size is too low.',
  'Help us price delivery, minimums, and deposits better.',
  'We rely too much on marketplaces and want more direct orders.',
] as const;

function formatCurrency(cents: number | null) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function SnapshotStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 14, background: '#FFFFFF', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  children,
  background = '#FFFFFF',
  border = '1px solid #E7E5E4',
  color = '#1C1917',
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  background?: string;
  border?: string;
  color?: string;
}) {
  return (
    <section style={{ border, borderRadius: 18, background, padding: 20, color }}>
      {eyebrow ? (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: background === '#1C1917' ? '#D4A853' : '#A16207', marginBottom: 8 }}>
          {eyebrow}
        </div>
      ) : null}
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  );
}

function SnapshotPanel({ snapshot }: { snapshot: GrowthAdvisorSnapshot }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
      <SnapshotStat label="Active offers" value={String(snapshot.activePackages)} sub={`${snapshot.activeAddOns} add-ons live`} />
      <SnapshotStat label="Locations" value={String(snapshot.activeLocations)} sub={snapshot.serviceTypes.length ? snapshot.serviceTypes.join(', ') : 'No service types configured'} />
      <SnapshotStat label="Avg package price" value={formatCurrency(snapshot.averagePackagePriceCents)} sub={snapshot.priceRange.lowCents != null && snapshot.priceRange.highCents != null ? `${formatCurrency(snapshot.priceRange.lowCents)} to ${formatCurrency(snapshot.priceRange.highCents)}` : 'Set from your live catalog'} />
      <SnapshotStat label="Recent traction" value={String(snapshot.recentOrders30d)} sub={`${snapshot.completedOrders} completed orders total`} />
      <SnapshotStat label="Minimum order" value={formatCurrency(snapshot.minimumOrderCents)} sub={snapshot.leadTimeDays != null ? `${snapshot.leadTimeDays} day lead time` : 'Lead time not configured'} />
      <SnapshotStat label="Payouts" value={snapshot.payoutsReady ? 'Ready' : 'Needs setup'} sub={snapshot.depositRequired == null ? 'Deposit settings unavailable' : snapshot.depositRequired ? 'Deposits required' : 'Deposits optional'} />
    </div>
  );
}

function StrategyList({
  items,
  tone,
}: {
  items: string[];
  tone: 'dark' | 'light';
}) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '10px 12px',
            borderRadius: 12,
            background: tone === 'dark' ? 'rgba(255,255,255,0.06)' : '#FAFAF9',
            border: tone === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EEEAE4',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: tone === 'dark' ? 'rgba(212,168,83,0.18)' : '#FEF3C7',
              color: tone === 'dark' ? '#FDE68A' : '#A16207',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function AnalysisPanel({
  analysis,
  snapshot,
}: {
  analysis: GrowthAdvisorPlan;
  snapshot: GrowthAdvisorSnapshot;
}) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SectionCard
        eyebrow="Growth Advisor"
        title={analysis.growthInsight}
        background="#1C1917"
        border="1px solid #292524"
        color="#FAFAF9"
      >
        <div style={{ fontSize: 13, color: '#E7E5E4', lineHeight: 1.6 }}>
          {analysis.stageSummary}
        </div>
      </SectionCard>

      <SectionCard title="Live business snapshot">
        <SnapshotPanel snapshot={snapshot} />
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 16 }}>
        <SectionCard eyebrow="Stage" title={analysis.businessStage}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: '#44403C' }}>
            {analysis.biggestOpportunity}
          </div>
        </SectionCard>

        <SectionCard eyebrow="30-day target" title={analysis.thirtyDayGoal} background="#1D7A55" border="1px solid #166534" color="#F0FDF4">
          <div style={{ fontSize: 13, lineHeight: 1.6, color: '#DCFCE7' }}>
            Built from your current storefront, live offers, and setup decisions.
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard eyebrow="Recommended offer" title={analysis.recommendedOffer.name}>
          <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.55, marginBottom: 14 }}>
            {analysis.recommendedOffer.description}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            <SnapshotStat label="Target price" value={formatCurrency(analysis.recommendedOffer.priceCents)} />
            <SnapshotStat label="Minimum guests" value={String(analysis.recommendedOffer.minimumGuests)} />
            <SnapshotStat label="Service style" value={analysis.recommendedOffer.serviceStyle} />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Pricing guidance" title="Set your offer to convert">
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ padding: '12px 14px', borderRadius: 12, background: '#FAFAF9', border: '1px solid #EEEAE4' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 4 }}>Minimum order</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1917' }}>{formatCurrency(analysis.pricingGuidance.minimumOrderCents)}</div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 12, background: '#FAFAF9', border: '1px solid #EEEAE4' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 4 }}>Delivery fee</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1917' }}>{formatCurrency(analysis.pricingGuidance.deliveryFeeCents)}</div>
            </div>
            <div style={{ fontSize: 13, color: '#44403C', lineHeight: 1.55 }}>
              <strong style={{ color: '#1C1917' }}>{analysis.pricingGuidance.depositPolicy}</strong>
              <div style={{ marginTop: 6 }}>{analysis.pricingGuidance.notes}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard eyebrow="Channels" title="Where to drive demand first">
          <StrategyList items={analysis.channelStrategy} tone="light" />
        </SectionCard>

        <SectionCard eyebrow="Next steps" title="What your team should do next">
          <StrategyList items={analysis.nextSteps} tone="light" />
        </SectionCard>
      </div>

      <a
        href={`mailto:orders@mail.trayloophq.com?subject=${encodeURIComponent(`Add Growth Advisor for ${snapshot.organizationName}`)}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 18px',
          borderRadius: 12,
          background: '#D4A853',
          color: '#1C1917',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Ask about the Growth Advisor add-on →
      </a>
    </div>
  );
}

export default function GrowthAdvisorPage() {
  const [billing, setBilling] = useState<MerchantBillingSubscription | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GrowthAdvisorResult | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    void fetchBillingSubscription()
      .then((next) => setBilling(next))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load Growth Advisor access.'))
      .finally(() => setCheckingAccess(false));
  }, []);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    setError('');

    try {
      const usingExistingSubscription = Boolean(billing?.subscription) && !(billing?.canCheckout ?? false);
      const result = await createBillingCheckout({
        successUrl: usingExistingSubscription
          ? `${window.location.origin}/growth-advisor?upgraded=1`
          : `${window.location.origin}/onboarding?billing=success`,
        cancelUrl: usingExistingSubscription
          ? `${window.location.origin}/growth-advisor`
          : `${window.location.origin}/onboarding?billing=cancel`,
        addOns: ['growth_advisor'],
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Growth Advisor checkout right now.');
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleAnalyze() {
    setLoading(true);
    setError('');

    try {
      const next = await generateGrowthAdvisor({ notes: notes.trim() || undefined });
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate your growth plan right now.');
    } finally {
      setLoading(false);
    }
  }

  function resetAdvisor() {
    setResult(null);
    setError('');
  }

  const entitlement = billing?.features.growthAdvisor;
  const unlocked = growthAdvisorEnabled && Boolean(entitlement?.enabled);
  const canPurchase = growthAdvisorEnabled && Boolean(entitlement?.available) && ((billing?.canCheckout ?? false) || Boolean(billing?.subscription));
  const usingExistingSubscription = Boolean(billing?.subscription) && !(billing?.canCheckout ?? false);

  if (checkingAccess) {
    return <p style={{ color: '#78716C' }}>Loading Growth Advisor...</p>;
  }

  if (!growthAdvisorEnabled || !unlocked) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <section style={{ border: '1px solid #E7E5E4', borderRadius: 20, background: '#FFFFFF', padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: '#1C1917', color: '#FAFAF9', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Premium Add-On
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, color: '#1C1917' }}>Growth Advisor</h1>
          <p style={{ fontSize: 14, color: '#57534E', margin: '10px 0 0', maxWidth: 760, lineHeight: 1.7 }}>
            Growth Advisor is sold as an add-on product. Add it from this page and it unlocks immediately for this merchant workspace.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 22 }}>
            <SnapshotStat label="Status" value={entitlement?.enabled ? 'Unlocked' : 'Locked'} sub={entitlement?.enabled ? 'Ready to use now' : 'Not included in this workspace'} />
            <SnapshotStat label="Price" value={`$${((entitlement?.priceCents ?? 9900) / 100).toFixed(0)}`} sub={`per ${entitlement?.interval ?? 'month'}`} />
            <SnapshotStat label="Best for" value="Launch + growth" sub="Menu, pricing, channel, and repeat-order guidance" />
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <div style={{ ...featureCalloutStyle }}>
              Uses your live storefront, offer mix, payouts setup, and order traction to generate a merchant-specific growth plan.
            </div>
            <div style={{ ...featureCalloutStyle }}>
              Great for onboarding teams creating menus and storefronts for merchants before launch.
            </div>
            <div style={{ ...featureCalloutStyle }}>
              Designed as an incremental revenue add-on, separate from the base TrayLoop subscription.
            </div>
            {usingExistingSubscription ? (
              <div style={{ ...featureCalloutStyle, borderColor: '#FDE68A', background: '#FFFBEB', color: '#92400E' }}>
                This merchant already has base billing active. Add Growth Advisor here and we will attach it to the current subscription.
              </div>
            ) : null}
          </div>

          {error ? (
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
              {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            {canPurchase ? (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#D4A853',
                  color: '#1C1917',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: upgradeLoading ? 'wait' : 'pointer',
                }}
              >
                {upgradeLoading ? 'Redirecting...' : 'Add Growth Advisor to onboarding →'}
              </button>
            ) : null}
            <a
              href="/launch"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 18px',
                borderRadius: 12,
                border: '1px solid #D6D3D1',
                background: '#FFFFFF',
                color: '#57534E',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Return to Launch Center
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <style>{`
        @media (max-width: 900px) {
          .growth-advisor-grid,
          .growth-advisor-double {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: '#1C1917', color: '#FAFAF9', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Premium Add-On
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, color: '#1C1917' }}>Growth Advisor</h1>
          <p style={{ fontSize: 14, color: '#57534E', margin: '8px 0 0', maxWidth: 760 }}>
            Turn your live storefront, pricing, and launch setup into a 30-day catering growth plan. This is built as a premium merchant add-on, so the recommendations are grounded in your actual TrayLoop setup instead of generic advice.
          </p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', maxWidth: 280 }}>
          Start with your current setup or add a specific growth question. The advisor will use your live merchant data either way.
        </div>
      </div>

      <div className="growth-advisor-grid" style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: 18, alignItems: 'start' }}>
        <section style={{ border: '1px solid #E7E5E4', borderRadius: 20, background: '#FFFFFF', padding: 20, position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 6 }}>
                Strategy Prompt
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1917' }}>What should the advisor focus on?</div>
            </div>
            {result ? (
              <button
                onClick={resetAdvisor}
                style={{
                  border: '1px solid #D6D3D1',
                  background: '#FFFFFF',
                  color: '#57534E',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            ) : null}
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Examples: We are new to catering and need our first package strategy. Or: Help us improve repeat orders without relying on marketplaces."
            style={{
              width: '100%',
              minHeight: 168,
              resize: 'vertical',
              borderRadius: 16,
              border: `1px solid ${error ? '#FCA5A5' : '#D6D3D1'}`,
              background: error ? '#FFF7F7' : '#FAFAF9',
              color: '#1C1917',
              padding: 16,
              fontSize: 14,
              lineHeight: 1.55,
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {PROMPT_IDEAS.map((idea) => (
              <button
                key={idea}
                onClick={() => setNotes(idea)}
                style={{
                  borderRadius: 999,
                  border: '1px solid #E7E5E4',
                  background: '#FFFFFF',
                  color: '#57534E',
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {idea}
              </button>
            ))}
          </div>

          {error ? (
            <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
              {error}
            </div>
          ) : null}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '13px 16px',
              borderRadius: 14,
              border: 'none',
              background: loading ? '#1C1917' : '#D4A853',
              color: loading ? '#FAFAF9' : '#1C1917',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Building your growth plan...' : 'Generate Growth Advisor plan →'}
          </button>

          <div style={{ marginTop: 14, fontSize: 12, color: '#78716C', lineHeight: 1.6 }}>
            Uses your live packages, locations, pricing setup, and recent order history to recommend what to sell, what to price, and what to fix first.
          </div>
        </section>

        <div>
          {result ? (
            <AnalysisPanel analysis={result.analysis} snapshot={result.snapshot} />
          ) : (
            <div className="growth-advisor-double" style={{ display: 'grid', gap: 16 }}>
              <SectionCard eyebrow="What this add-on does" title="A merchant-side catering strategist">
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    'Reads your current storefront setup, offer mix, and order traction.',
                    'Finds the fastest next offer, pricing, and channel improvements.',
                    'Packages the advice into a clear 30-day plan your onboarding team can act on.',
                  ].map((line, index) => (
                    <div key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#44403C' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 999, background: '#FEF3C7', color: '#A16207', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {index + 1}
                      </div>
                      <div>{line}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard eyebrow="Ideal use cases" title="Best for merchants who need help launching or growing">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['New to catering', 'Create the first three offers and get pricing right.'],
                    ['Low repeat orders', 'Fix the offer mix, lead time, and reorder flow.'],
                    ['Marketplace heavy', 'Shift demand to direct orders and owned channels.'],
                    ['Onboarding team', 'Build menus and storefront strategy for merchants faster.'],
                  ].map(([title, description]) => (
                    <div key={title} style={{ border: '1px solid #EEEAE4', borderRadius: 14, padding: '14px 16px', background: '#FFFFFF' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>{title}</div>
                      <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.5 }}>{description}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const featureCalloutStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  background: '#FAFAF9',
  border: '1px solid #EEEAE4',
  fontSize: 13,
  color: '#44403C',
  lineHeight: 1.6,
};
