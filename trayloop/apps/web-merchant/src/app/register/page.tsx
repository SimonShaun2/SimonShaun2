'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading registration...</p>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialStep = searchParams.get('step') === 'org' ? 'org' : 'account';
  const existingMerchant = initialStep === 'org';
  const [step, setStep] = useState<'account' | 'org'>(initialStep);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgPhone, setOrgPhone] = useState('');

  const [token, setToken] = useState('');

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (initialStep === 'org') {
      setToken(localStorage.getItem('token') ?? '');
    }
  }, [initialStep]);

  async function handleAccountSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setStep('org');
  }

  async function handleOrgSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usingExistingMerchantSession = Boolean(token);
      const response = await fetch(
        usingExistingMerchantSession
          ? `${API_URL}/api/organizations`
          : `${API_URL}/api/auth/register/merchant-workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(usingExistingMerchantSession ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            usingExistingMerchantSession
              ? {
                  name: orgName.trim(),
                  slug: orgSlug.trim(),
                  phone: orgPhone.trim() || undefined,
                }
              : {
                  name: name.trim(),
                  email: email.trim(),
                  password,
                  organizationName: orgName.trim(),
                  organizationSlug: orgSlug.trim(),
                  phone: orgPhone.trim() || undefined,
                },
          ),
        },
      );

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error?.message ?? 'Failed to create merchant workspace');
      }

      const nextToken = usingExistingMerchantSession ? token : json.data.token;
      const organization = usingExistingMerchantSession ? json.data : json.data.organization;

      localStorage.setItem('token', nextToken);
      localStorage.setItem('orgId', organization.id);
      localStorage.setItem('orgSlug', organization.slug ?? orgSlug.trim());
      localStorage.setItem('orgName', organization.name ?? orgName.trim());
      window.location.href = '/onboarding?welcome=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create merchant workspace');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: 24, maxWidth: 980, margin: '2.5rem auto' }}>
      <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: '28px 30px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, color: '#1C1917' }}>
            {step === 'account' ? 'Create your merchant account' : existingMerchant ? 'Finish your TrayLoop workspace' : 'Create your TrayLoop workspace'}
          </h1>
          <p style={{ color: '#78716C', margin: '8px 0 0', fontSize: 14, lineHeight: 1.6 }}>
            {step === 'account'
              ? 'Start with the account that will own the merchant workspace.'
              : existingMerchant
                ? 'You are signed in. Now create the workspace that powers your storefront, payouts, and billing.'
                : 'Create the business profile that powers your storefront, payouts, and billing in one guided flow.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
          <StepCard active={step === 'account'} done={Boolean(token) || existingMerchant} title="Account" subtitle="Owner login" />
          <StepCard active={step === 'org'} done={false} title="Workspace" subtitle="Business profile" />
        </div>

        {error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 600 }}>
            {error}
          </div>
        ) : null}

        {step === 'account' && !existingMerchant ? (
          <form onSubmit={handleAccountSubmit}>
            <Field label="Your name">
              <input value={name} onChange={(event) => setName(event.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Password (min 8 characters)">
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} style={inputStyle} />
            </Field>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              Continue to workspace
            </button>
          </form>
        ) : (
          <form onSubmit={handleOrgSubmit}>
            <Field label="Business name">
              <input
                value={orgName}
                onChange={(event) => {
                  const next = event.target.value;
                  setOrgName(next);
                  if (!orgSlug) {
                    setOrgSlug(slugify(next));
                  }
                }}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Storefront slug">
              <input
                value={orgSlug}
                onChange={(event) => setOrgSlug(slugify(event.target.value))}
                required
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 6 }}>
                Your storefront: <code>{`order.trayloophq.com/${orgSlug || 'your-brand'}`}</code>
              </div>
            </Field>
            <Field label="Phone (optional)">
              <input type="tel" value={orgPhone} onChange={(event) => setOrgPhone(event.target.value)} style={inputStyle} />
            </Field>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!existingMerchant ? (
                <button type="button" onClick={() => setStep('account')} style={secondaryButtonStyle}>
                  Back
                </button>
              ) : null}
              <button type="submit" disabled={loading} style={primaryButtonStyle}>
                {loading ? 'Creating workspace...' : existingMerchant ? 'Finish workspace setup' : 'Create workspace'}
              </button>
            </div>
          </form>
        )}

        <p style={{ marginTop: 18, fontSize: 13, color: '#78716C' }}>
          Already have an account? <a href="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </section>

      <aside style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#1C1917', color: '#FAFAF9', padding: '28px 26px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 12 }}>
          What happens next
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>TrayLoop-owned onboarding</h2>
        <p style={{ fontSize: 14, color: '#E7E5E4', lineHeight: 1.7, margin: 0 }}>
          After signup, TrayLoop guides the merchant through payouts, subscription billing, storefront setup, and launch readiness before they ever need to think about Stripe as a separate system.
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          <SideCard title="1. Merchant payouts" body="Connect the merchant payout account so customer deposits can flow into the business." />
          <SideCard title="2. TrayLoop Pro" body="Start the $99/month platform subscription from inside TrayLoop using a hosted checkout." />
          <SideCard title="3. Launch storefront" body="Review the live storefront, place a test order, and go live with confidence." />
        </div>

        <div style={{ marginTop: 22, padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAF9', marginBottom: 6 }}>Sandbox-friendly</div>
          <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>
            This flow is designed to work cleanly against the TrayLoop sandbox Stripe account first, then promote to live when the platform is ready.
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepCard({ active, done, title, subtitle }: { active: boolean; done: boolean; title: string; subtitle: string }) {
  return (
    <div style={{ border: `1px solid ${active ? '#1C1917' : '#E7E5E4'}`, borderRadius: 12, background: active ? '#FAFAF9' : '#FFFFFF', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: 999, background: done ? '#DCFCE7' : active ? '#1C1917' : '#F5F5F4', color: done ? '#166534' : active ? '#FFFFFF' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
          {done ? 'OK' : active ? '2' : '1'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: '#78716C' }}>{subtitle}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function SideCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#FAFAF9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  padding: '10px 12px',
  fontSize: 14,
  color: '#1C1917',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#57534E',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
