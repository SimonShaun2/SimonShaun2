'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  createBillingCheckout,
  createBillingPortal,
  createPaymentOnboardingLink,
  fetchOnboardingStatus,
  syncPaymentStatus,
  type MerchantOnboardingStatus,
} from '../../lib/api';

type BannerTone = 'success' | 'warning' | 'error';

function MerchantOnboardingPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<MerchantOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ tone: BannerTone; text: string } | null>(null);
  const [paymentAction, setPaymentAction] = useState<'connect' | 'refresh' | null>(null);
  const [billingAction, setBillingAction] = useState<'checkout' | 'portal' | null>(null);

  useEffect(() => {
    void loadOnboarding();
  }, []);

  useEffect(() => {
    const stripeState = searchParams.get('stripe');
    const billingState = searchParams.get('billing');
    const welcomeState = searchParams.get('welcome');

    if (welcomeState === '1') {
      setBanner({ tone: 'success', text: 'Your merchant workspace is ready. Next we will connect payouts, billing, and launch readiness inside TrayLoop.' });
      void loadOnboarding(false);
      return;
    }

    if (stripeState === 'complete') {
      setBanner({ tone: 'success', text: 'Stripe onboarding returned to TrayLoop. We refreshed your payout status.' });
      void handleRefreshPayments();
      return;
    }

    if (stripeState === 'refresh') {
      setBanner({ tone: 'warning', text: 'Stripe asked for another onboarding pass. Review the requirements and continue below.' });
      void handleRefreshPayments();
      return;
    }

    if (billingState === 'success') {
      setBanner({ tone: 'success', text: 'Stripe checkout completed. Your TrayLoop Pro subscription will sync in a moment.' });
      void loadOnboarding(false);
      return;
    }

    if (billingState === 'cancel') {
      setBanner({ tone: 'warning', text: 'Subscription checkout was canceled before completion. You can restart it any time.' });
      void loadOnboarding(false);
    }
  }, [searchParams]);

  async function loadOnboarding(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }
    setError('');

    try {
      const next = await fetchOnboardingStatus();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  async function handleStartPayments() {
    setPaymentAction('connect');
    setError('');
    try {
      const result = await createPaymentOnboardingLink({
        returnUrl: `${window.location.origin}/onboarding`,
        refreshUrl: `${window.location.origin}/onboarding`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open Stripe onboarding');
      setPaymentAction(null);
    }
  }

  async function handleRefreshPayments() {
    setPaymentAction('refresh');
    setError('');
    try {
      await syncPaymentStatus();
      await loadOnboarding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh Stripe status');
    } finally {
      setPaymentAction(null);
    }
  }

  async function handleStartSubscription() {
    setBillingAction('checkout');
    setError('');
    try {
      const result = await createBillingCheckout({
        successUrl: `${window.location.origin}/onboarding?billing=success`,
        cancelUrl: `${window.location.origin}/onboarding?billing=cancel`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start TrayLoop Pro checkout');
    } finally {
      setBillingAction(null);
    }
  }

  async function handleManageBilling() {
    setBillingAction('portal');
    setError('');
    try {
      const result = await createBillingPortal({
        returnUrl: `${window.location.origin}/onboarding`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing manager');
    } finally {
      setBillingAction(null);
    }
  }

  const paymentBadge = useMemo(() => {
    const status = data?.paymentStatus.status ?? 'not_started';
    return badgeConfig(status);
  }, [data?.paymentStatus.status]);

  const billingBadge = useMemo(() => {
    const status = data?.billing.state ?? 'not_started';
    return billingConfig(status);
  }, [data?.billing.state]);

  if (loading && !data) {
    return <p style={{ color: '#78716C' }}>Loading merchant onboarding...</p>;
  }

  if (error && !data) {
    return (
      <div>
        <h1 style={headingStyle}>Payments Onboarding</h1>
        <Banner tone="error" text={error} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={headingStyle}>Payments Onboarding</h1>
          <p style={{ margin: '6px 0 0', color: '#78716C', fontSize: 14, maxWidth: 720 }}>
            Finish your payout setup, activate billing, and confirm this storefront is ready to launch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Pill
            bg={data.stripeMode === 'live' ? '#DCFCE7' : data.stripeMode === 'test' ? '#FEF3C7' : '#F3F4F6'}
            color={data.stripeMode === 'live' ? '#166534' : data.stripeMode === 'test' ? '#92400E' : '#57534E'}
          >
            {data.stripeMode === 'live' ? 'Stripe Live' : data.stripeMode === 'test' ? 'Stripe Sandbox' : 'Stripe Disabled'}
          </Pill>
          <Pill bg="#F5F5F4" color="#57534E">{data.launch.completed} of {data.launch.total} launch steps complete</Pill>
        </div>
      </div>

      {banner ? <Banner tone={banner.tone} text={banner.text} /> : null}
      {error ? <Banner tone="error" text={error} /> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 24 }}>
        <SummaryCard label="Launch Progress" value={`${data.launch.progressPercent}%`} sub={`${data.launch.completed}/${data.launch.total} milestone${data.launch.total === 1 ? '' : 's'}`} />
        <SummaryCard label="Payouts" value={data.paymentStatus.status === 'ready' ? 'Ready' : paymentBadge.label} sub={data.paymentStatus.chargesEnabled ? 'Charges enabled' : 'Stripe still needs action'} accent={data.paymentStatus.status === 'ready'} />
        <SummaryCard label="Billing" value={billingBadge.label} sub={billingDetail(data)} accent={data.billing.state === 'active'} />
        <SummaryCard label="Storefront" value={data.readiness.canLaunchStorefront ? 'Ready to launch' : 'Needs review'} sub={data.storefront.storefrontUrl} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard
            title="1. Business foundation"
            subtitle="Make sure your storefront has a location and at least one orderable package."
            badge={`${data.setup.completedSteps}/${data.setup.totalSteps} setup steps`}
          >
            <ChecklistRow done={data.setup.steps.offering.done} title="Offerings" description={`${data.setup.steps.offering.count ?? 0} active package${(data.setup.steps.offering.count ?? 0) === 1 ? '' : 's'} ready for customers.`} href="/catalog" cta="Open Offerings" />
            <ChecklistRow done={data.setup.steps.location.done} title="Operations" description={`${data.storefront.locations.length} active location${data.storefront.locations.length === 1 ? '' : 's'} available on the storefront.`} href="/settings#operations" cta="Edit Operations" />
          </SectionCard>

          <SectionCard
            title="2. Merchant payouts"
            subtitle="This connects your merchant payout account so customer deposits can flow to your business."
            badge={paymentBadge.label}
          >
            <div style={{ marginBottom: 16 }}>
              <Pill bg={paymentBadge.bg} color={paymentBadge.color}>{paymentBadge.label}</Pill>
            </div>
            <p style={bodyStyle}>
              {data.paymentStatus.status === 'ready'
                ? 'Your payout account is connected and ready to accept customer deposit flows.'
                : data.paymentStatus.status === 'action_required'
                  ? 'Stripe has outstanding requirements. Resolve them here and come back to TrayLoop once complete.'
                  : data.paymentStatus.status === 'in_progress'
                    ? 'Your payout account exists, but Stripe still needs more information before deposits can be routed.'
                    : 'Start TrayLoop merchant payments onboarding to create and connect your payout account.'}
            </p>
            {data.paymentStatus.disabledReason || data.paymentStatus.requirementsPastDue.length > 0 || data.paymentStatus.requirementsCurrentlyDue.length > 0 ? (
              <div style={noteStyle}>
                {data.paymentStatus.disabledReason ? (
                  <div style={{ marginBottom: 6 }}>Stripe reason: {data.paymentStatus.disabledReason.replaceAll('_', ' ')}</div>
                ) : null}
                {data.paymentStatus.requirementsPastDue.length > 0 ? (
                  <div style={{ marginBottom: 6 }}>Past due: {data.paymentStatus.requirementsPastDue.join(', ')}</div>
                ) : null}
                {data.paymentStatus.requirementsCurrentlyDue.length > 0 ? (
                  <div>Currently due: {data.paymentStatus.requirementsCurrentlyDue.join(', ')}</div>
                ) : null}
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button type="button" onClick={handleStartPayments} disabled={paymentAction !== null} style={primaryButtonStyle}>
                {paymentAction === 'connect'
                  ? 'Redirecting...'
                  : data.paymentStatus.status === 'ready'
                    ? 'Reopen Stripe'
                    : data.paymentStatus.status === 'not_started'
                      ? 'Start Merchant Payments'
                      : 'Continue Stripe Onboarding'}
              </button>
              <button type="button" onClick={handleRefreshPayments} disabled={paymentAction !== null} style={secondaryButtonStyle}>
                {paymentAction === 'refresh' ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="3. TrayLoop Pro billing"
            subtitle="This is the platform subscription for your TrayLoop workspace, separate from customer transactions."
            badge={billingBadge.label}
          >
            <div style={{ marginBottom: 16 }}>
              <Pill bg={billingBadge.bg} color={billingBadge.color}>{billingBadge.label}</Pill>
            </div>
            <p style={bodyStyle}>{billingDetail(data)}</p>
            {data.billing.subscription?.trialEnd ? (
              <div style={noteStyle}>
                Trial ends on {new Date(data.billing.subscription.trialEnd).toLocaleDateString()}.
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {data.billing.canCheckout ? (
                <button type="button" onClick={handleStartSubscription} disabled={billingAction !== null} style={primaryButtonStyle}>
                  {billingAction === 'checkout' ? 'Redirecting...' : data.billing.state === 'canceled' ? 'Resubscribe' : 'Start TrayLoop Pro'}
                </button>
              ) : null}
              {data.billing.canManage ? (
                <button type="button" onClick={handleManageBilling} disabled={billingAction !== null} style={secondaryButtonStyle}>
                  {billingAction === 'portal' ? 'Opening...' : 'Manage Subscription'}
                </button>
              ) : null}
              <a href="/billing" style={secondaryButtonStyle}>Open Billing Hub</a>
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard
            title="Launch readiness"
            subtitle="Review the remaining blockers, then finish the next required step."
          >
            {data.launch.blockers.length === 0 ? (
              <div style={{ ...noteStyle, background: '#F0FDF4', borderColor: '#BBF7D0', color: '#166534' }}>
                You are ready to launch. Review your live storefront and start taking orders.
              </div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20, color: '#57534E', fontSize: 14, lineHeight: 1.8 }}>
                {data.launch.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>{data.launch.nextAction.title}</div>
              <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{data.launch.nextAction.description}</div>
              <a href={data.launch.nextAction.href} style={{ ...primaryButtonStyle, display: 'inline-flex', marginTop: 12 }}>
                {data.launch.nextAction.cta}
              </a>
            </div>
          </SectionCard>

          <SectionCard title="Live storefront" subtitle="Open your branded TrayLoop storefront and test the exact customer journey.">
            <div style={{ ...noteStyle, background: '#FAFAF9' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>{data.storefront.organization.name}</div>
              <div style={{ fontSize: 12, color: '#57534E', wordBreak: 'break-all' }}>{data.launch.liveStorefrontUrl ?? data.storefront.storefrontUrl}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <a href={data.launch.liveStorefrontUrl ?? data.storefront.storefrontUrl} target="_blank" rel="noopener noreferrer" style={primaryButtonStyle}>
                View Storefront
              </a>
              <a href="/settings#storefront" style={secondaryButtonStyle}>Review Storefront Links</a>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default function MerchantOnboardingPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading merchant onboarding...</p>}>
      <MerchantOnboardingPageContent />
    </Suspense>
  );
}

function badgeConfig(status: MerchantOnboardingStatus['paymentStatus']['status']) {
  switch (status) {
    case 'ready':
      return { label: 'Ready', bg: '#DCFCE7', color: '#166534' };
    case 'action_required':
      return { label: 'Action Required', bg: '#FEE2E2', color: '#B91C1C' };
    case 'in_progress':
      return { label: 'In Progress', bg: '#FFF7ED', color: '#C2410C' };
    default:
      return { label: 'Not Started', bg: '#FEF3C7', color: '#92400E' };
  }
}

function billingConfig(status: MerchantOnboardingStatus['billing']['state']) {
  switch (status) {
    case 'active':
      return { label: 'Active', bg: '#DCFCE7', color: '#166534' };
    case 'trialing':
      return { label: 'Trialing', bg: '#FEF3C7', color: '#92400E' };
    case 'past_due':
      return { label: 'Past Due', bg: '#FEE2E2', color: '#B91C1C' };
    case 'unpaid':
      return { label: 'Unpaid', bg: '#FEE2E2', color: '#B91C1C' };
    case 'canceled':
      return { label: 'Canceled', bg: '#F3F4F6', color: '#57534E' };
    default:
      return { label: 'Not Started', bg: '#F3F4F6', color: '#57534E' };
  }
}

function billingDetail(data: MerchantOnboardingStatus) {
  switch (data.billing.state) {
    case 'trialing':
      return data.billing.trialDaysRemaining != null
        ? `${data.billing.trialDaysRemaining} day${data.billing.trialDaysRemaining === 1 ? '' : 's'} left in your TrayLoop Pro trial.`
        : 'Your TrayLoop Pro trial is active.';
    case 'active':
      return data.billing.subscription?.currentPeriodEnd
        ? `Next billing on ${new Date(data.billing.subscription.currentPeriodEnd).toLocaleDateString()}.`
        : 'TrayLoop Pro is active.';
    case 'past_due':
      return 'Your subscription needs a payment method update to stay healthy.';
    case 'unpaid':
      return 'Stripe marked the subscription unpaid. Open billing to resolve it.';
    case 'canceled':
      return 'Resubscribe to reactivate TrayLoop Pro for this workspace.';
    default:
      return 'Start TrayLoop Pro to unlock the live platform subscription for this merchant workspace.';
  }
}

function Banner({ tone, text }: { tone: BannerTone; text: string }) {
  const palette =
    tone === 'success'
      ? { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534' }
      : tone === 'warning'
        ? { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' }
        : { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' };

  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color, borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
      {text}
    </div>
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
  accent?: boolean;
}) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, padding: '18px 20px', background: accent ? '#292524' : '#FFFFFF' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent ? '#D4A853' : '#78716C', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ? '#FAFAF9' : '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: accent ? '#D6D3D1' : '#78716C', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1C1917' }}>{title}</h2>
          <p style={{ fontSize: 13, color: '#78716C', margin: '6px 0 0', lineHeight: 1.6 }}>{subtitle}</p>
        </div>
        {badge ? <Pill bg="#F5F5F4" color="#57534E">{badge}</Pill> : null}
      </div>
      {children}
    </section>
  );
}

function ChecklistRow({
  done,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #F5F5F4', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 240, flex: 1 }}>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: done ? '#DCFCE7' : '#F5F5F4', color: done ? '#166534' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {done ? 'OK' : '...'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{title}</div>
          <div style={{ fontSize: 13, color: '#78716C', marginTop: 4, lineHeight: 1.6 }}>{description}</div>
        </div>
      </div>
      <a href={href} style={secondaryButtonStyle}>{cta}</a>
    </div>
  );
}

function Pill({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#1C1917',
  margin: 0,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#57534E',
  margin: 0,
  lineHeight: 1.7,
};

const noteStyle: React.CSSProperties = {
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 13,
  color: '#78350F',
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
