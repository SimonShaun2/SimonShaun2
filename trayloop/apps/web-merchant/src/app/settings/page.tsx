'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { clearMerchantSession, merchantResetHref } from '../../lib/session';
import { getStorefrontUrl } from '../../lib/storefront';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PaymentStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SetupStep {
  done: boolean;
  label: string;
  count?: number;
}

interface SetupStatus {
  isComplete: boolean;
  slug: string;
  completedSteps: number;
  totalSteps: number;
  steps: {
    offering: SetupStep;
    location: SetupStep;
    payments: SetupStep;
  };
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  last7DaysRevenue: number;
  last7DaysOrders: number;
  last30DaysRevenue: number;
  completedOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
}

interface PublicLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  serviceTypes: string[];
  leadTimeHours: number;
  minimumOrderAmount: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadiusMiles: number | null;
  depositRequired: boolean;
}

interface StorefrontSnapshot {
  merchant: {
    description: string | null;
    website: string | null;
    phone: string | null;
  };
  locations: PublicLocation[];
}

type SetupState = 'loading' | 'not_started' | 'incomplete' | 'active';

const DEFAULTS: PaymentStatus = {
  stripeAccountId: null,
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  onboardingComplete: false,
};

const SECTION_LINKS = [
  { id: 'profile', label: 'Profile' },
  { id: 'storefront', label: 'Storefront' },
  { id: 'operations', label: 'Operations' },
  { id: 'payments', label: 'Payments' },
  { id: 'team', label: 'Team & Access' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing & Security' },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={<p style={{ color: '#6b7280' }}>Loading settings...</p>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const stripeParam = searchParams.get('stripe');

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(DEFAULTS);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [storefront, setStorefront] = useState<StorefrontSnapshot | null>(null);
  const [setupState, setSetupState] = useState<SetupState>('loading');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (stripeParam === 'complete' || stripeParam === 'refresh') {
      syncStatus();
    }
  }, [stripeParam]);

  const storefrontUrl = useMemo(() => {
    if (!setupStatus?.slug) return null;
    return getStorefrontUrl(setupStatus.slug);
  }, [setupStatus]);

  const primaryLocation = storefront?.locations?.[0] ?? null;

  async function loadSettings() {
    setLoading(true);
    setActionError('');

    try {
      const [orgRes, setupRes, paymentRes, statsRes] = await Promise.all([
        apiFetch('/api/organizations/current'),
        apiFetch('/api/organizations/current/setup-status'),
        apiFetch('/api/organizations/current/payment-status').catch(() => ({ data: DEFAULTS })),
        apiFetch('/api/orders/stats').catch(() => ({ data: null })),
      ]);

      setOrganization(orgRes.data);
      setSetupStatus(setupRes.data);
      setStats(statsRes.data);
      applyStatus(paymentRes.data ?? DEFAULTS);

      if (setupRes.data?.slug) {
        localStorage.setItem('orgSlug', setupRes.data.slug);
        const publicRes = await fetch(`${API_URL}/api/storefront/${setupRes.data.slug}`);
        if (publicRes.ok) {
          const json = await publicRes.json();
          setStorefront(json.data);
        } else {
          setStorefront(null);
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function syncStatus() {
    try {
      const res = await apiFetch('/api/organizations/current/payment-status/sync', { method: 'POST' });
      applyStatus(res.data);
    } catch {
      try {
        const res = await apiFetch('/api/organizations/current/payment-status');
        applyStatus(res.data);
      } catch {
        applyStatus(DEFAULTS);
      }
    }
  }

  function applyStatus(status: PaymentStatus) {
    setPaymentStatus(status);
    if (status.onboardingComplete) {
      setSetupState('active');
    } else if (status.stripeAccountId) {
      setSetupState('incomplete');
    } else {
      setSetupState('not_started');
    }
  }

  async function handleSetupPayments() {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await apiFetch('/api/organizations/current/payment-onboarding-link', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: `${window.location.origin}/settings` }),
      });
      window.location.href = res.data.url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to start payment setup');
      setActionLoading(false);
    }
  }

  function handleMerchantSignOut() {
    clearMerchantSession();
    window.location.href = '/login';
  }

  const paymentCard = {
    loading: { title: 'Checking payment setup', badge: '', cta: null as string | null, body: 'Verifying your current Stripe connection.' },
    not_started: {
      title: 'Payments not started',
      badge: 'Not Started',
      cta: 'Set Up Payments',
      body: 'Connect Stripe to collect deposits and move from setup to taking live orders.',
    },
    incomplete: {
      title: 'Stripe onboarding incomplete',
      badge: 'Incomplete',
      cta: 'Continue Stripe Onboarding',
      body: 'Your account exists, but Stripe still needs more information before charges and payouts are fully enabled.',
    },
    active: {
      title: 'Payments connected',
      badge: 'Active',
      cta: null,
      body: 'Stripe is connected and your merchant account is ready for live payment activity.',
    },
  }[setupState];

  if (loading && !organization) {
    return <p style={{ color: '#6b7280' }}>Loading settings...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px' }}>Settings</h1>
        <p style={{ fontSize: 14, color: '#78716C', margin: 0 }}>
          Manage your merchant profile, storefront, operations, payments, and team access from one place.
        </p>
      </div>

      {stripeParam === 'complete' ? (
        <Banner bg="#F0FDF4" border="#BBF7D0" color="#166534" text="Stripe onboarding updated." />
      ) : null}
      {stripeParam === 'refresh' ? (
        <Banner bg="#FEF3C7" border="#FDE68A" color="#92400E" text="Your Stripe session expired. Continue below to finish setup." />
      ) : null}
      {actionError ? (
        <Banner bg="#FEF2F2" border="#FECACA" color="#DC2626" text={actionError} />
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <SummaryCard
          label="Storefront"
          value={setupStatus?.isComplete ? 'Live' : 'In Setup'}
          sub={storefrontUrl ?? 'Finish setup to publish your storefront'}
          accent={setupStatus?.isComplete ? '#22C55E' : '#D4A853'}
        />
        <SummaryCard
          label="Payments"
          value={paymentStatus.onboardingComplete ? 'Connected' : paymentStatus.stripeAccountId ? 'Incomplete' : 'Not Started'}
          sub={paymentStatus.chargesEnabled ? 'Charges enabled' : 'Charges not enabled'}
          accent={paymentStatus.onboardingComplete ? '#22C55E' : '#D97706'}
        />
        <SummaryCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          sub={stats ? `${stats.totalOrders} total orders tracked` : 'Orders will appear after activity'}
          accent="#3B82F6"
        />
        <SummaryCard
          label="Average Order"
          value={stats ? `$${(stats.avgOrderValue / 100).toFixed(0)}` : '$0'}
          sub={stats ? `${stats.totalCustomers} customers in this workspace` : 'No customer history yet'}
          accent="#1C1917"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <aside
          style={{
            position: 'sticky',
            top: 24,
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: 14,
            background: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Settings Sections
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTION_LINKS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#44403C',
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#FAFAF9',
                }}
              >
                {section.label}
              </a>
            ))}
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SectionCard id="profile" title="Business Profile" subtitle="The core information customers and your team use to identify this merchant account.">
            <KeyValueGrid
              items={[
                ['Business name', organization?.name ?? 'Not set'],
                ['Store slug', organization?.slug ?? 'Not set'],
                ['Website', organization?.website ?? storefront?.merchant.website ?? 'Not set'],
                ['Phone', organization?.phone ?? storefront?.merchant.phone ?? 'Not set'],
                ['Status', organization?.isActive ? 'Active' : 'Inactive'],
                ['Last updated', organization?.updatedAt ? new Date(organization.updatedAt).toLocaleDateString() : 'Unknown'],
              ]}
            />
            {(organization?.description || storefront?.merchant.description) ? (
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: '#FAFAF9', color: '#57534E', fontSize: 13, lineHeight: 1.6 }}>
                {organization?.description ?? storefront?.merchant.description}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard id="storefront" title="Storefront" subtitle="Preview and share the public ordering page tied to your merchant slug.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Live URL
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #E7E5E4', fontFamily: 'monospace', fontSize: 12, color: '#44403C', wordBreak: 'break-all' }}>
                  {storefrontUrl ?? 'Complete your setup to generate a live storefront link.'}
                </div>
              </div>
              {storefrontUrl ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={primaryButtonStyle}
                  >
                    View Storefront
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(storefrontUrl)}
                    style={secondaryButtonStyle}
                  >
                    Copy Link
                  </button>
                </div>
              ) : null}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: '#78716C' }}>
              {setupStatus?.isComplete
                ? 'Your storefront is ready to accept orders. Test it before sharing it broadly.'
                : `Setup progress: ${setupStatus?.completedSteps ?? 0} of ${setupStatus?.totalSteps ?? 3} steps complete.`}
            </div>
          </SectionCard>

          <SectionCard id="operations" title="Operations" subtitle="Operational settings your storefront communicates today from your live data.">
            {primaryLocation ? (
              <KeyValueGrid
                items={[
                  ['Primary location', primaryLocation.name],
                  ['Address', `${primaryLocation.address}, ${primaryLocation.city}, ${primaryLocation.state} ${primaryLocation.zipCode}`],
                  ['Lead time', `${primaryLocation.leadTimeHours} hours`],
                  ['Minimum order', `$${(primaryLocation.minimumOrderAmount / 100).toFixed(0)}`],
                  ['Service types', primaryLocation.serviceTypes.join(', ')],
                  ['Delivery radius', primaryLocation.deliveryRadiusMiles ? `${primaryLocation.deliveryRadiusMiles} miles` : 'Not set'],
                  ['Deposit required', primaryLocation.depositRequired ? 'Yes' : 'No'],
                ]}
              />
            ) : (
              <EmptyHint text="Location and order requirement details will appear here after your storefront settings are configured." />
            )}
          </SectionCard>

          <SectionCard id="payments" title="Payments" subtitle="Stripe connection status, onboarding progress, and live payment readiness.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: setupState === 'active' ? '#DCFCE7' : setupState === 'incomplete' ? '#FFF7ED' : '#FEF3C7',
                      color: setupState === 'active' ? '#166534' : setupState === 'incomplete' ? '#C2410C' : '#92400E',
                    }}
                  >
                    {paymentCard.badge || 'Checking'}
                  </span>
                  <strong style={{ fontSize: 16, color: '#1C1917' }}>{paymentCard.title}</strong>
                </div>
                <p style={{ fontSize: 14, color: '#57534E', margin: '0 0 14px', lineHeight: 1.6 }}>{paymentCard.body}</p>
                <KeyValueGrid
                  items={[
                    ['Stripe account', paymentStatus.stripeAccountId ?? 'Not connected'],
                    ['Charges', paymentStatus.chargesEnabled ? 'Enabled' : 'Disabled'],
                    ['Payouts', paymentStatus.payoutsEnabled ? 'Enabled' : 'Disabled'],
                    ['Details submitted', paymentStatus.detailsSubmitted ? 'Yes' : 'No'],
                  ]}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paymentCard.cta ? (
                  <button type="button" onClick={handleSetupPayments} disabled={actionLoading} style={primaryButtonStyle}>
                    {actionLoading ? 'Redirecting...' : paymentCard.cta}
                  </button>
                ) : null}
                <button type="button" onClick={syncStatus} style={secondaryButtonStyle}>
                  Refresh Status
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="team" title="Team & Access" subtitle="Who can access the merchant dashboard and how sessions are managed right now.">
            <KeyValueGrid
              items={[
                ['Current access model', 'Owner / admin membership via the merchant account'],
                ['Reset password flow', 'Available from the sign-in page'],
                ['Sign out support', 'Available from the sidebar and sign-in page'],
                ['Team invitations', 'Coming soon'],
              ]}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <a href={merchantResetHref()} style={secondaryButtonStyle}>
                Reset Password
              </a>
              <button type="button" onClick={handleMerchantSignOut} style={secondaryButtonStyle}>
                Sign Out
              </button>
            </div>
          </SectionCard>

          <SectionCard id="notifications" title="Notifications" subtitle="What the merchant experience supports today and what’s planned next.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <InfoTile title="In-app notifications" body="Notification bell is live in the merchant sidebar." />
              <InfoTile title="Follow-up workflow" body="Follow-ups are created from order activity and managed in the dashboard." />
              <InfoTile title="Email alerts" body="Merchant-level notification preferences are not configurable yet." muted />
              <InfoTile title="Reminder rules" body="Custom notification rules and delivery settings are planned next." muted />
            </div>
          </SectionCard>

          <SectionCard id="billing" title="Billing & Security" subtitle="Billing visibility is tied to Stripe setup today; deeper subscription controls can follow later.">
            <KeyValueGrid
              items={[
                ['Merchant billing state', paymentStatus.onboardingComplete ? 'Payment-ready' : 'Setup in progress'],
                ['Storefront readiness', setupStatus?.isComplete ? 'Live' : 'Incomplete'],
                ['Security basics', 'Password reset and sign-out are live'],
                ['Advanced billing tools', 'Coming soon'],
              ]}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <a href={merchantResetHref()} style={secondaryButtonStyle}>
                Reset Password
              </a>
              {storefrontUrl ? (
                <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" style={primaryButtonStyle}>
                  Open Storefront
                </a>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Banner({ bg, border, color, text }: { bg: string; border: string; color: string; text: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
      <p style={{ color, fontWeight: 600, margin: 0, fontSize: 14 }}>{text}</p>
    </div>
  );
}

function SectionCard({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, padding: '16px 18px', background: '#FFFFFF', borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#A8A29E', marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function KeyValueGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #E7E5E4' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 14, color: '#1C1917', lineHeight: 1.5 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function InfoTile({ title, body, muted }: { title: string; body: string; muted?: boolean }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #E7E5E4', background: muted ? '#FAFAF9' : '#FFFFFF' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: muted ? '#57534E' : '#1C1917', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div style={{ padding: '18px 16px', borderRadius: 10, border: '1px dashed #D6D3D1', background: '#FAFAF9', color: '#78716C', fontSize: 13 }}>
      {text}
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 10,
  background: '#1C1917',
  color: '#FFFFFF',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 10,
  background: '#FFFFFF',
  color: '#57534E',
  border: '1px solid #D6D3D1',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};
