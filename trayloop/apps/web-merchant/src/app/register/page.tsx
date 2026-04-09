'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { identifyAnalytics, trackEvent } from '@trayloop/analytics';
import { createBillingCheckout } from '../../lib/api';
import { growthAdvisorEnabled } from '../../lib/features';
import { ensureMerchantSession, hasMerchantSession, markMerchantSession } from '../../lib/session';
import { useMobile } from '../../lib/use-mobile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TRAYLOOP_PRO_PLAN = 'trayloop_pro' as const;
const GROWTH_ADVISOR_SELECTION_KEY = 'trayloop-growth-advisor-selected';

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
  const [selectedPlan] = useState<string>(TRAYLOOP_PRO_PLAN);
  const [includeGrowthAdvisor, setIncludeGrowthAdvisor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [hasExistingMerchantSession, setHasExistingMerchantSession] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedGrowthAdvisorSelection = window.localStorage.getItem(GROWTH_ADVISOR_SELECTION_KEY);
    if (savedGrowthAdvisorSelection === 'true') {
      setIncludeGrowthAdvisor(true);
    }

    if (existingMerchant) {
      setHasExistingMerchantSession(hasMerchantSession());
      void ensureMerchantSession().then(() => {
        setHasExistingMerchantSession(hasMerchantSession());
      });
    }
  }, [existingMerchant]);

  function handlePlanContinue() {
    setError('');
    setStep('details');
  }

  function toggleGrowthAdvisorSelection(nextValue: boolean) {
    setIncludeGrowthAdvisor(nextValue);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GROWTH_ADVISOR_SELECTION_KEY, String(nextValue));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    trackEvent('merchant_register_started', {
      has_existing_session: hasExistingMerchantSession,
      selected_plan: selectedPlan || TRAYLOOP_PRO_PLAN,
      growth_advisor_selected: includeGrowthAdvisor,
    });

    try {
      const usingExistingMerchantSession = hasExistingMerchantSession;
      if (usingExistingMerchantSession) {
        await ensureMerchantSession();
      }
      const response = await fetch(
        usingExistingMerchantSession
          ? `${API_URL}/api/organizations`
          : `${API_URL}/api/auth/register/merchant-workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(usingExistingMerchantSession ? { 'x-trayloop-session-scope': 'merchant' } : {}),
          },
          credentials: 'include',
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

      const organization = usingExistingMerchantSession ? json.data : json.data.organization;

      markMerchantSession();
      identifyAnalytics(usingExistingMerchantSession ? organization.id : json.data.user.id, {
        email: email.trim() || undefined,
        organization_slug: organization.slug ?? orgSlug.trim(),
        organization_name: organization.name ?? orgName.trim(),
        flow: usingExistingMerchantSession ? 'existing_session' : 'new_registration',
      });
      trackEvent('merchant_workspace_created', {
        organization_id: organization.id,
        organization_slug: organization.slug ?? orgSlug.trim(),
        flow: usingExistingMerchantSession ? 'existing_session' : 'new_registration',
      });
      localStorage.setItem('orgId', organization.id);
      localStorage.setItem('orgSlug', organization.slug ?? orgSlug.trim());
      localStorage.setItem('orgName', organization.name ?? orgName.trim());

      try {
        trackEvent('subscription_checkout_started', {
          organization_id: organization.id,
          organization_slug: organization.slug ?? orgSlug.trim(),
        });
        const result = await createBillingCheckout({
          successUrl: `${window.location.origin}/onboarding?welcome=1&billing=success`,
          cancelUrl: `${window.location.origin}/onboarding?welcome=1&billing=cancel`,
          includeGrowthAdvisor,
        });
        window.location.href = result.url;
      } catch {
        trackEvent('subscription_checkout_unavailable', {
          organization_id: organization.id,
          organization_slug: organization.slug ?? orgSlug.trim(),
        });
        window.location.href = '/onboarding?welcome=1&billing=required';
      }
    } catch (err) {
      trackEvent('merchant_register_failed', {
        has_existing_session: hasExistingMerchantSession,
        message: err instanceof Error ? err.message : 'unknown_error',
      });
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
              ? 'You are signed in. Finish the business workspace that powers payouts, launch setup, and your storefront.'
              : step === 'plan'
                ? 'TrayLoop Pro is already selected for you. Review the plan, then continue into the merchant workspace details.'
                : 'Create the owner account and business profile, then we will immediately open secure checkout to activate this merchant workspace.'}
          </p>
        </div>

        {!existingMerchant ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
            <StepCard active={step === 'plan'} done={step === 'details'} number="1" title="Plan" subtitle="TrayLoop Pro" />
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
            <div
              style={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 18,
                border: '2px solid #1C1917',
                background: '#FAFAF9',
                padding: isMobile ? '18px 16px 16px' : '20px 20px 18px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 14,
                  borderRadius: 999,
                  background: '#1C1917',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 10px',
                }}
              >
                Step 1: Plan selected
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: '#1C1917' }}>TrayLoop Pro</div>
                  <div style={{ fontSize: 14, color: '#57534E', marginTop: 6 }}>
                    $49/month
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', alignSelf: isMobile ? 'flex-start' : 'auto', borderRadius: 999, background: '#F5F5F4', color: '#57534E', fontSize: 12, fontWeight: 700, padding: '6px 10px' }}>
                  Selected by default
                </div>
              </div>

              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: 13, fontWeight: 600, lineHeight: 1.55 }}>
                No extra click is needed here. TrayLoop Pro is the active signup plan, so you can continue straight to the merchant details step.
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <PlanBullet text="Create the merchant workspace under the live TrayLoop Pro plan." />
                <PlanBullet text="Secure subscription checkout happens during signup before the merchant workspace can launch." />
                {growthAdvisorEnabled ? <PlanBullet text="Optional add-ons like Growth Advisor can be attached during onboarding and unlock as soon as billing confirms." /> : null}
                <PlanBullet text="If more plans are added later, this section can expand without changing the rest of signup." />
              </div>
            </div>

            {growthAdvisorEnabled ? (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 16,
                  border: `1px solid ${includeGrowthAdvisor ? '#1D7A55' : '#E7E5E4'}`,
                  background: includeGrowthAdvisor ? '#F0FDF4' : '#FFFFFF',
                  padding: isMobile ? '16px 16px 14px' : '18px 18px 16px',
                }}
              >
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includeGrowthAdvisor}
                    onChange={(event) => toggleGrowthAdvisorSelection(event.target.checked)}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>Add Growth Advisor</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: '#1C1917', color: '#FAFAF9', fontSize: 11, fontWeight: 700, padding: '4px 8px' }}>
                        +$99/mo
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
                      Unlock AI-backed launch and catering growth guidance for your onboarding team and merchant workspace. If selected here, it gets attached to the same subscription checkout and becomes usable right after billing syncs.
                    </div>
                  </div>
                </label>
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, max-content)', gap: 10, marginTop: 18 }}>
              <button type="button" onClick={handlePlanContinue} style={{ ...primaryButtonStyle, width: isMobile ? '100%' : undefined }}>
                Continue to merchant details
              </button>
              <a href="/login" style={{ ...secondaryLinkButtonStyle, width: isMobile ? '100%' : undefined }}>Sign in instead</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!existingMerchant ? (
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: 13, fontWeight: 600, lineHeight: 1.55 }}>
                Step 2: Create the merchant workspace. Your selected plan is <strong>TrayLoop Pro</strong>, and secure checkout will open automatically after this form.
                {growthAdvisorEnabled ? (
                  <div style={{ marginTop: 6 }}>
                    Growth Advisor: <strong>{includeGrowthAdvisor ? 'Included in checkout' : 'Not included'}</strong>.
                  </div>
                ) : null}
              </div>
            ) : null}
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
                {loading ? 'Creating workspace and opening checkout...' : existingMerchant ? 'Finish workspace setup' : 'Create merchant workspace'}
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
          How it works
        </div>
        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>Everything you need to sell catering online</h2>
        <p style={{ fontSize: 14, color: '#E7E5E4', lineHeight: 1.7, margin: 0 }}>
          TrayLoop Pro is preselected, so merchants can create the workspace and start accepting catering orders without getting stuck on plan choice.
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          <SideCard title="1. TrayLoop Pro is selected" body="The $49/month plan is already preselected so merchants can move straight into signup." />
          <SideCard title="2. Create your workspace" body="Set up your owner account and business profile in one step." />
          <SideCard title="3. Complete billing and go live" body="Secure checkout opens automatically, then you can build your menu and launch the storefront." />
        </div>

        <div style={{ marginTop: 22, padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAF9', marginBottom: 6 }}>Simple and direct</div>
          <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>
            Plan is already selected, signup creates the workspace, and billing opens automatically so the flow keeps moving.
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
