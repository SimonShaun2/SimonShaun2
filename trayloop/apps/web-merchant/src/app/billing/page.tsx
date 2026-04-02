'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  createBillingCheckout,
  createBillingPortal,
  fetchOnboardingStatus,
  type MerchantOnboardingStatus,
} from '../../lib/api';
import { merchantResetHref } from '../../lib/session';

function MerchantBillingPageContent() {
  const searchParams = useSearchParams();
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={headingStyle}>Billing</h1>
          <p style={{ margin: '6px 0 0', color: '#78716C', fontSize: 14, maxWidth: 720 }}>
            Manage the TrayLoop Pro subscription inside TrayLoop, then hand off payment method and invoicing mechanics to Stripe only when needed.
          </p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, background: data.stripeMode === 'test' ? '#FEF3C7' : '#DCFCE7', color: data.stripeMode === 'test' ? '#92400E' : '#166534', fontSize: 12, fontWeight: 700 }}>
          {data.stripeMode === 'test' ? 'TrayLoop Sandbox Billing' : 'TrayLoop Live Billing'}
        </span>
      </div>

      {billingParam === 'success' ? (
        <Banner tone="success" title="Subscription checkout completed" body="Stripe is syncing the new subscription into TrayLoop now." />
      ) : null}
      {billingParam === 'cancel' ? (
        <Banner tone="warning" title="Checkout canceled" body="Your subscription did not change. You can restart checkout whenever you are ready." />
      ) : null}
      {error ? <Banner tone="error" title="Billing action failed" body={error} /> : null}

      <Banner tone={statusBanner.tone} title={statusBanner.title} body={statusBanner.body} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        <SummaryCard label="Plan" value={data.billing.planName} sub={`$${(data.billing.priceCents / 100).toFixed(0)}/${data.billing.interval}`} />
        <SummaryCard label="Status" value={data.billing.state.replace('_', ' ')} sub={data.billing.trialDaysRemaining != null ? `${data.billing.trialDaysRemaining} days of trial left` : data.billing.subscription?.currentPeriodEnd ? `Period ends ${new Date(data.billing.subscription.currentPeriodEnd).toLocaleDateString()}` : 'No subscription yet'} />
        <SummaryCard label="Merchant payouts" value={data.paymentStatus.status === 'ready' ? 'Connected' : 'Needs setup'} sub={data.paymentStatus.chargesEnabled ? 'Customer transactions enabled' : 'Finish Connect onboarding'} />
        <SummaryCard label="Storefront readiness" value={data.readiness.canLaunchStorefront ? 'Launch ready' : 'Blocked'} sub={data.launch.blockers.length === 0 ? 'Billing and payouts aligned' : data.launch.blockers[0]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 1fr)', gap: 20 }}>
        <section style={sectionStyle}>
          <header style={{ marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>TrayLoop Pro</h2>
            <p style={sectionSubtitleStyle}>Keep subscription management inside TrayLoop until the exact moment a secure payment surface is needed.</p>
          </header>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <FeatureRow title="Hosted Stripe checkout" body="Merchants start the subscription from TrayLoop and only leave for the branded hosted checkout session." />
            <FeatureRow title="Hosted billing portal" body="Payment method updates, cancellation, and invoice management happen through Stripe's managed portal when needed." />
            <FeatureRow title="TrayLoop-owned merchant context" body="TrayLoop stays the control center for setup state, next actions, readiness, and customer-facing launch decisions." />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            {data.billing.canCheckout ? (
              <button type="button" onClick={handleCheckout} disabled={action !== null} style={primaryButtonStyle}>
                {action === 'checkout' ? 'Redirecting...' : data.billing.state === 'canceled' ? 'Resubscribe' : 'Start Subscription'}
              </button>
            ) : null}
            {data.billing.canManage ? (
              <button type="button" onClick={handlePortal} disabled={action !== null} style={secondaryButtonStyle}>
                {action === 'portal' ? 'Opening...' : 'Manage Subscription'}
              </button>
            ) : null}
            <a href="/onboarding" style={secondaryButtonStyle}>Open Onboarding</a>
          </div>

          <div style={noteStyle}>
            <div style={{ fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>White-label strategy</div>
            <div style={{ color: '#57534E', fontSize: 13, lineHeight: 1.7 }}>
              TrayLoop owns the UX framing, next steps, and merchant context. Stripe stays under the curtain for subscription checkout,
              stored payment methods, retries, invoices, and compliance-heavy billing flows.
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <header style={{ marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>Branding and domains</h2>
            <p style={sectionSubtitleStyle}>Use Stripe-hosted surfaces, but make them feel like TrayLoop instead of a disconnected third-party jump.</p>
          </header>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#57534E', fontSize: 13, lineHeight: 1.8 }}>
            <li>Stripe account branding should use the TrayLoop name, icon, logo, and colors.</li>
            <li>Billing and Checkout should stay on the TrayLoop sandbox account while you test this phase.</li>
            <li>Connect onboarding should return merchants to TrayLoop-owned routes like <code>/onboarding</code> and <code>/settings</code>.</li>
            <li>Use Stripe hosted checkout, billing portal, and onboarding to avoid a much larger custom-payment build.</li>
            <li>Keep customer transactions on connected accounts and TrayLoop Pro billing on the platform account.</li>
          </ul>

          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            <ActionRow label="Payout onboarding" value={data.paymentStatus.status === 'ready' ? 'Connected' : 'Needs attention'} href="/onboarding" />
            <ActionRow label="Billing hub" value={data.billing.state.replace('_', ' ')} href="/billing" />
            <ActionRow label="Password reset" value="Security tools live" href={merchantResetHref()} />
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

function FeatureRow({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, padding: '14px 16px', background: '#FAFAF9' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function ActionRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1px solid #E7E5E4', textDecoration: 'none', background: '#FFFFFF', color: '#1C1917' }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#78716C' }}>{value}</span>
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

const noteStyle: React.CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: '14px 16px',
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
