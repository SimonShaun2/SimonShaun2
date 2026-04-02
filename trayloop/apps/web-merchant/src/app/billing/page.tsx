'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMobile } from '../../lib/use-mobile';
import {
  createBillingCheckout,
  createBillingPortal,
  fetchOnboardingStatus,
  type MerchantOnboardingStatus,
} from '../../lib/api';
import { merchantResetHref } from '../../lib/session';

function MerchantBillingPageContent() {
  const searchParams = useSearchParams();
  const isMobile = useMobile(900);
  const [data, setData] = useState<MerchantOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'checkout' | 'portal' | null>(null);

  useEffect(() => {
    void loadBilling();
  }, []);

  const statusBanner = useMemo(() => {
    const billingState = data?.billing.state ?? 'not_started';
    switch (billingState) {
      case 'active':
        return { tone: 'success' as const, title: 'TrayLoop Pro is active', body: data?.billing.subscription?.currentPeriodEnd ? `Next billing date: ${new Date(data.billing.subscription.currentPeriodEnd).toLocaleDateString()}.` : 'Your merchant workspace is covered and ready for ongoing billing.' };
      case 'trialing':
        return { tone: 'warning' as const, title: 'Your free trial is running', body: data?.billing.trialDaysRemaining != null ? `${data.billing.trialDaysRemaining} day${data.billing.trialDaysRemaining === 1 ? '' : 's'} remaining before your first paid cycle.` : 'Your free trial is active.' };
      case 'past_due':
      case 'unpaid':
        return { tone: 'error' as const, title: 'Billing needs attention', body: 'Update your payment method to keep TrayLoop Pro healthy and avoid storefront disruption.' };
      case 'canceled':
        return { tone: 'error' as const, title: 'Subscription canceled', body: 'Resubscribe to reactivate the paid TrayLoop workspace for this merchant.' };
      default:
        return { tone: 'warning' as const, title: 'Start your TrayLoop Pro subscription', body: 'Launch billing from inside TrayLoop and keep the merchant experience branded end to end.' };
    }
  }, [data]);

  async function loadBilling(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }
    setError('');
    try {
      const next = await fetchOnboardingStatus();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  async function handleCheckout() {
    setAction('checkout');
    setError('');
    try {
      const result = await createBillingCheckout({
        successUrl: `${window.location.origin}/billing?billing=success`,
        cancelUrl: `${window.location.origin}/billing?billing=cancel`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open Stripe checkout');
      setAction(null);
    }
  }

  async function handlePortal() {
    setAction('portal');
    setError('');
    try {
      const result = await createBillingPortal({
        returnUrl: `${window.location.origin}/billing`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setAction(null);
    }
  }

  if (loading && !data) {
    return <p style={{ color: '#78716C' }}>Loading billing...</p>;
  }

  if (error && !data) {
    return (
      <div>
        <h1 style={headingStyle}>Billing</h1>
        <Banner tone="error" title="Billing failed to load" body={error} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const billingParam = searchParams.get('billing');
  const welcomeParam = searchParams.get('welcome');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ ...headingStyle, fontSize: isMobile ? 24 : headingStyle.fontSize }}>Billing</h1>
          <p style={{ margin: '6px 0 0', color: '#78716C', fontSize: 14, maxWidth: 720 }}>
            Manage your TrayLoop Pro subscription, payout setup, and storefront billing readiness.
          </p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, background: data.stripeMode === 'test' ? '#FEF3C7' : '#DCFCE7', color: data.stripeMode === 'test' ? '#92400E' : '#166534', fontSize: 12, fontWeight: 700 }}>
          {data.stripeMode === 'test' ? 'TrayLoop Sandbox Billing' : 'TrayLoop Live Billing'}
        </span>
      </div>

      {welcomeParam === '1' ? (
        <Banner
          tone="success"
          title="Merchant workspace created"
          body="Start your 30-day TrayLoop Pro trial first. After billing is in place, finish payouts and launch setup."
        />
      ) : null}
      {billingParam === 'success' ? (
        <Banner tone="success" title="Subscription checkout completed" body="Stripe is syncing the new subscription into TrayLoop now." />
      ) : null}
      {billingParam === 'cancel' ? (
        <Banner tone="warning" title="Checkout canceled" body="Your subscription did not change. You can restart checkout whenever you are ready." />
      ) : null}
      {error ? <Banner tone="error" title="Billing action failed" body={error} /> : null}

      <Banner tone={statusBanner.tone} title={statusBanner.title} body={statusBanner.body} />

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 160 : 220}px, 1fr))`, gap: 14, marginBottom: 24 }}>
        <SummaryCard label="Plan" value={data.billing.planName} sub={`$${(data.billing.priceCents / 100).toFixed(0)}/${data.billing.interval}`} />
        <SummaryCard label="Status" value={data.billing.state.replace('_', ' ')} sub={data.billing.trialDaysRemaining != null ? `${data.billing.trialDaysRemaining} days of trial left` : data.billing.subscription?.currentPeriodEnd ? `Period ends ${new Date(data.billing.subscription.currentPeriodEnd).toLocaleDateString()}` : 'No subscription yet'} />
        <SummaryCard label="Merchant payouts" value={data.paymentStatus.status === 'ready' ? 'Connected' : 'Needs setup'} sub={data.paymentStatus.chargesEnabled ? 'Customer transactions enabled' : 'Finish Connect onboarding'} />
        <SummaryCard label="Storefront readiness" value={data.readiness.canLaunchStorefront ? 'Launch ready' : 'Blocked'} sub={data.launch.blockers.length === 0 ? 'Billing and payouts aligned' : data.launch.blockers[0]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(280px, 1fr)', gap: 20 }}>
        <section style={{ ...sectionStyle, padding: isMobile ? 18 : sectionStyle.padding }}>
          <header style={{ marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>TrayLoop Pro</h2>
            <p style={sectionSubtitleStyle}>Start, resume, or manage your merchant subscription from here.</p>
          </header>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <InfoTile title="Current plan" body={`${data.billing.planName} at $${(data.billing.priceCents / 100).toFixed(0)}/${data.billing.interval}.`} />
            <InfoTile
              title="Subscription state"
              body={
                data.billing.subscription?.currentPeriodEnd
                  ? `Status: ${data.billing.state.replace('_', ' ')}. Current period ends ${new Date(data.billing.subscription.currentPeriodEnd).toLocaleDateString()}.`
                  : `Status: ${data.billing.state.replace('_', ' ')}.`
              }
            />
            <InfoTile title="What this controls" body="TrayLoop Pro keeps the storefront live and unlocks the paid merchant workspace for this restaurant." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : undefined, gap: 10, marginBottom: 18 }}>
            {data.billing.canCheckout ? (
              <button type="button" onClick={handleCheckout} disabled={action !== null} style={{ ...primaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                {action === 'checkout'
                  ? 'Redirecting...'
                  : data.billing.state === 'canceled'
                    ? 'Resubscribe'
                    : data.billing.state === 'not_started'
                      ? 'Start 30-Day Trial'
                      : 'Start Subscription'}
              </button>
            ) : null}
            {data.billing.canManage ? (
              <button type="button" onClick={handlePortal} disabled={action !== null} style={{ ...secondaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                {action === 'portal' ? 'Opening...' : 'Manage Subscription'}
              </button>
            ) : null}
            <a href="/onboarding" style={{ ...secondaryButtonStyle, width: isMobile ? '100%' : undefined }}>Open Onboarding</a>
          </div>
        </section>

        <section style={{ ...sectionStyle, padding: isMobile ? 18 : sectionStyle.padding }}>
          <header style={{ marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>Account health</h2>
            <p style={sectionSubtitleStyle}>What still needs attention before this storefront is fully billable.</p>
          </header>

          <div style={{ display: 'grid', gap: 10 }}>
            <StatusRow
              label="Subscription"
              value={data.billing.state.replace('_', ' ')}
              detail={data.billing.canManage ? 'Manage payment method, invoices, and cancellation.' : 'Start billing to activate TrayLoop Pro.'}
              href="/billing"
            />
            <StatusRow
              label="Payout onboarding"
              value={data.paymentStatus.status === 'ready' ? 'Connected' : 'Needs attention'}
              detail={data.paymentStatus.status === 'ready' ? 'Customer payouts are enabled.' : 'Finish payout onboarding to collect customer deposits.'}
              href="/onboarding"
            />
            <StatusRow
              label="Storefront launch"
              value={data.readiness.canLaunchStorefront ? 'Ready' : 'Blocked'}
              detail={data.launch.blockers.length === 0 ? 'Billing and payouts are aligned for launch.' : data.launch.blockers[0]}
              href="/settings"
            />
            <StatusRow
              label="Password reset"
              value="Available"
              detail="Security tools are live for this merchant workspace."
              href={merchantResetHref()}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function MerchantBillingPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading billing...</p>}>
      <MerchantBillingPageContent />
    </Suspense>
  );
}

function Banner({ tone, title, body }: { tone: 'success' | 'warning' | 'error'; title: string; body: string }) {
  const palette =
    tone === 'success'
      ? { bg: '#F0FDF4', border: '#BBF7D0', title: '#166534', body: '#166534' }
      : tone === 'warning'
        ? { bg: '#FFFBEB', border: '#FDE68A', title: '#92400E', body: '#92400E' }
        : { bg: '#FEF2F2', border: '#FECACA', title: '#B91C1C', body: '#DC2626' };

  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ color: palette.title, fontSize: 14, fontWeight: 700 }}>{title}</div>
      <div style={{ color: palette.body, fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, padding: '18px 20px', background: '#FFFFFF' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function InfoTile({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, padding: '14px 16px', background: '#FAFAF9' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function StatusRow({ label, value, detail, href }: { label: string; value: string; detail: string; href: string }) {
  return (
    <a href={href} style={{ display: 'grid', gap: 4, padding: '12px 14px', borderRadius: 12, border: '1px solid #E7E5E4', textDecoration: 'none', background: '#FFFFFF', color: '#1C1917' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: '#78716C' }}>{value}</span>
      </div>
      <span style={{ fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>{detail}</span>
    </a>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#1C1917',
  margin: 0,
};

const sectionStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 14,
  background: '#FFFFFF',
  padding: 22,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1C1917',
  margin: 0,
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#78716C',
  margin: '6px 0 0',
  lineHeight: 1.6,
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  padding: '10px 14px',
  borderRadius: 10,
  border: 'none',
  background: '#1C1917',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#57534E',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
