'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMobile } from '../../lib/use-mobile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TRIAL_PLAN = 'trayloop_pro_trial' as const;

type Step = 'plan' | 'details';

export default function RegisterPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading registration...</p>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const isMobile = useMobile(900);
  const existingMerchant = searchParams.get('step') === 'org';
  const [step, setStep] = useState<Step>(existingMerchant ? 'details' : 'plan');
  const [selectedPlan, setSelectedPlan] = useState<string>(existingMerchant ? TRIAL_PLAN : '');
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
    if (typeof window === 'undefined') {
      return;
    }

    if (existingMerchant) {
      setToken(localStorage.getItem('token') ?? '');
    }
  }, [existingMerchant]);

  function handlePlanContinue() {
    if (!selectedPlan) {
      setError('Select a TrayLoop plan before creating the merchant workspace.');
      return;
    }

    setError('');
    setStep('details');
  }

  async function handleSubmit(event: React.FormEvent) {
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
                  selectedPlan,
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
      window.location.href = '/billing?welcome=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create merchant workspace');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.12fr) minmax(300px, 0.88fr)',
        gap: isMobile ? 16 : 24,
        maxWidth: 1040,
        margin: isMobile ? '1rem auto' : '2.5rem auto',
        padding: isMobile ? '0 12px 24px' : '0 16px',
      }}
    >
      <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: isMobile ? '22px 18px' : '28px 30px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: isMobile ? 26 : 30, fontWeight: 700, margin: 0, color: '#1C1917', lineHeight: 1.15 }}>
            {existingMerchant
              ? 'Finish your TrayLoop workspace'
              : step === 'plan'
                ? 'Choose your TrayLoop plan'
                : 'Create your merchant workspace'}
          </h1>
          <p style={{ color: '#78716C', margin: '8px 0 0', fontSize: 14, lineHeight: 1.6 }}>
            {existingMerchant
              ? 'You are signed in. Finish the business workspace that powers billing, payouts, and your storefront.'
              : step === 'plan'
                ? 'Start with TrayLoop Pro and its 30-day trial. After that, create the owner account and business profile.'
                : 'Create the owner account and business profile for the merchant workspace you just selected.'}
          </p>
        </div>

        {!existingMerchant ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
            <StepCard active={step === 'plan'} done={step === 'details'} number="1" title="Plan" subtitle="TrayLoop Pro trial" />
            <StepCard active={step === 'details'} done={false} number="2" title="Merchant account" subtitle="Owner + business setup" />
          </div>
        ) : null}

        {error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 600 }}>
            {error}
          </div>
        ) : null}

        {!existingMerchant && step === 'plan' ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlan(TRIAL_PLAN);
                setError('');
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 16,
                border: selectedPlan === TRIAL_PLAN ? '1px solid #1C1917' : '1px solid #E7E5E4',
                background: selectedPlan === TRIAL_PLAN ? '#FAFAF9' : '#FFFFFF',
                padding: isMobile ? '18px 16px 16px' : '20px 20px 18px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: '#1C1917' }}>TrayLoop Pro</div>
                  <div style={{ fontSize: 14, color: '#57534E', marginTop: 6 }}>
                    $99/month after a 30-day free trial
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', alignSelf: isMobile ? 'flex-start' : 'auto', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '6px 10px' }}>
                  30-day trial
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <PlanBullet text="Create the merchant workspace under the TrayLoop Pro trial flow." />
                <PlanBullet text="Start billing first, then finish payouts, operations, offerings, and launch setup." />
                <PlanBullet text="Future pricing tiers can be added here without changing the core signup flow." />
              </div>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, max-content)', gap: 10, marginTop: 18 }}>
              <button type="button" onClick={handlePlanContinue} style={{ ...primaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                Continue with TrayLoop Pro
              </button>
              <a href="/login" style={{ ...secondaryLinkButtonStyle, width: isMobile ? '100%' : undefined }}>Sign in instead</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!existingMerchant ? (
              <>
                <Field label="Owner name">
                  <input value={name} onChange={(event) => setName(event.target.value)} required style={inputStyle} />
                </Field>
                <Field label="Owner email">
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
                </Field>
                <Field label="Password (min 8 characters)">
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} style={inputStyle} />
                </Field>
              </>
            ) : null}

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
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 6, wordBreak: 'break-word' }}>
                Your storefront: <code>{`order.trayloophq.com/${orgSlug || 'your-brand'}`}</code>
              </div>
            </Field>
            <Field label="Business phone (optional)">
              <input type="tel" value={orgPhone} onChange={(event) => setOrgPhone(event.target.value)} style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : undefined, gap: 10 }}>
              {!existingMerchant ? (
                <button type="button" onClick={() => setStep('plan')} style={{ ...secondaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                  Back to plan
                </button>
              ) : null}
              <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                {loading ? 'Creating merchant workspace...' : existingMerchant ? 'Finish workspace setup' : 'Create merchant workspace'}
              </button>
            </div>
          </form>
        )}

        <p style={{ marginTop: 18, fontSize: 13, color: '#78716C' }}>
          Already have an account? <a href="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </section>

      <aside style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#1C1917', color: '#FAFAF9', padding: isMobile ? '22px 18px' : '28px 26px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 12 }}>
          Clean onboarding flow
        </div>
        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>Sales-ready and self-serve</h2>
        <p style={{ fontSize: 14, color: '#E7E5E4', lineHeight: 1.7, margin: 0 }}>
          Start with the TrayLoop Pro trial, create the merchant workspace, then finish billing and launch setup from inside TrayLoop.
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          <SideCard title="1. Select TrayLoop Pro" body="Choose the 30-day trial plan first so every new merchant workspace starts in the correct billing flow." />
          <SideCard title="2. Create the merchant workspace" body="Capture the owner login and business profile in one step so the workspace is ready immediately." />
          <SideCard title="3. Finish setup in Billing" body="Start the trial-backed billing flow first, then move into payouts, operations, offerings, and launch review." />
        </div>

        <div style={{ marginTop: 22, padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAF9', marginBottom: 6 }}>Why this flow</div>
          <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>
            It mirrors how a sales rep would onboard a merchant: choose the product, create the account, start billing, then finish launch setup without bouncing around.
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepCard({
  active,
  done,
  number,
  title,
  subtitle,
}: {
  active: boolean;
  done: boolean;
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ border: `1px solid ${active ? '#1C1917' : '#E7E5E4'}`, borderRadius: 12, background: active ? '#FAFAF9' : '#FFFFFF', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: 999, background: done ? '#DCFCE7' : active ? '#1C1917' : '#F5F5F4', color: done ? '#166534' : active ? '#FFFFFF' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
          {done ? 'OK' : number}
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

function PlanBullet({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: 999, background: '#F5F5F4', color: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginTop: 1 }}>
        OK
      </div>
      <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>{text}</div>
    </div>
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
  textDecoration: 'none',
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

const secondaryLinkButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  textDecoration: 'none',
};
