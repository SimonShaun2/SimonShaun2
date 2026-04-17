'use client';

import { Suspense, useState } from 'react';
import { identifyAnalytics, trackEvent } from '@trayloop/analytics';
import { createBillingCheckout } from '../../lib/api';
import { growthAdvisorEnabled } from '../../lib/features';
import { markMerchantSession } from '../../lib/session';
import { useMobile } from '@trayloop/ui';
import { type PlanKey } from '@trayloop/types/plan-access';
import { getMerchantPlanDisplay, getMerchantPlanPriceLabel } from '../../lib/plan-copy';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_PLAN: PlanKey = 'starter';
const PLAN_OPTIONS: PlanKey[] = ['starter', 'pro', 'growth'];

type StepId = 'organization' | 'model' | 'plan' | 'payment' | 'subscription' | 'brand' | 'node';

const STEPS: { id: StepId; label: string; num: number }[] = [
  { id: 'organization', label: 'Organization', num: 1 },
  { id: 'model', label: 'Model', num: 2 },
  { id: 'plan', label: 'Plan', num: 3 },
  { id: 'payment', label: 'Payment', num: 4 },
  { id: 'subscription', label: 'Subscription', num: 5 },
  { id: 'brand', label: 'Brand', num: 6 },
  { id: 'node', label: 'Node', num: 7 },
];

const STEP_CTA: Record<StepId, string> = {
  organization: 'Continue to operating model',
  model: 'Continue to plan selection',
  plan: 'Continue to payment',
  payment: 'Continue to subscription',
  subscription: 'Create workspace and activate',
  brand: 'Continue to node setup',
  node: 'Finish and launch',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading...</p>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const isMobile = useMobile();

  const [currentStep, setCurrentStep] = useState<StepId>('organization');
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 – Organization
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [orgState, setOrgState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 – Model
  const [operatingModel, setOperatingModel] = useState<'delivery' | 'pickup' | 'both'>('both');

  // Step 3 – Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(DEFAULT_PLAN);
  const [includeGrowthAdvisor, setIncludeGrowthAdvisor] = useState(false);

  // Step 6 – Brand
  const [brandColor, setBrandColor] = useState('#E85618');
  const [displayFont, setDisplayFont] = useState('bricolage');

  // Step 7 – Node
  const [kitchenName, setKitchenName] = useState('');
  const [kitchenAddress, setKitchenAddress] = useState('');
  const [kitchenCity, setKitchenCity] = useState('');
  const [kitchenState, setKitchenState] = useState('');
  const [kitchenZip, setKitchenZip] = useState('');

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  function markComplete(id: StepId) {
    setCompletedSteps((prev) => new Set([...prev, id]));
  }

  function goBack() {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
      setError('');
    }
  }

  function goForward() {
    if (stepIndex < STEPS.length - 1) {
      markComplete(currentStep);
      setCurrentStep(STEPS[stepIndex + 1].id);
      setError('');
    }
  }

  function startOver() {
    setCurrentStep('organization');
    setCompletedSteps(new Set());
    setError('');
    setOrgName(''); setOrgSlug(''); setBillingEmail(''); setContactName('');
    setAddress(''); setCity(''); setOrgState(''); setZipCode(''); setPassword('');
    setOperatingModel('both');
    setSelectedPlan(DEFAULT_PLAN);
    setIncludeGrowthAdvisor(false);
    setBrandColor('#E85618');
    setDisplayFont('bricolage');
    setKitchenName(''); setKitchenAddress(''); setKitchenCity(''); setKitchenState(''); setKitchenZip('');
  }

  function validateCurrentStep(): string | null {
    if (currentStep === 'organization') {
      if (!orgName.trim()) return 'Organization name is required';
      if (!billingEmail.trim()) return 'Billing email is required';
      if (!contactName.trim()) return 'Primary contact name is required';
      if (!password || password.length < 8) return 'Password must be at least 8 characters';
      if (!orgSlug.trim()) return 'Organization slug is required';
    }
    return null;
  }

  async function handleContinue() {
    setError('');
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (currentStep === 'subscription') {
      await handleCreateWorkspace();
      return;
    }

    if (currentStep === 'node') {
      await handleFinish();
      return;
    }

    goForward();
  }

  async function handleCreateWorkspace() {
    setLoading(true);
    trackEvent('merchant_register_started', { selected_plan: selectedPlan });
    try {
      const response = await fetch(`${API_URL}/api/auth/register/merchant-workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          selectedPlan,
          name: contactName.trim(),
          email: billingEmail.trim(),
          password,
          organizationName: orgName.trim(),
          organizationSlug: orgSlug.trim(),
          phone: undefined,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message ?? 'Failed to create workspace');

      const organization = json.data.organization;
      markMerchantSession();
      identifyAnalytics(json.data.user.id, {
        email: billingEmail.trim(),
        organization_slug: organization.slug,
        organization_name: organization.name,
      });
      trackEvent('merchant_workspace_created', { organization_id: organization.id });
      localStorage.setItem('orgId', organization.id);
      localStorage.setItem('orgSlug', organization.slug);
      localStorage.setItem('orgName', organization.name);

      markComplete('subscription');
      setCurrentStep('brand');
    } catch (err) {
      trackEvent('merchant_register_failed', { message: err instanceof Error ? err.message : 'unknown' });
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    try {
      const result = await createBillingCheckout({
        plan: selectedPlan,
        successUrl: `${window.location.origin}/onboarding?welcome=1&billing=success`,
        cancelUrl: `${window.location.origin}/onboarding?welcome=1&billing=cancel`,
        addOns: includeGrowthAdvisor ? ['growth_advisor'] : [],
      });
      window.location.href = result.url;
    } catch {
      window.location.href = '/onboarding?welcome=1&billing=required';
    } finally {
      setLoading(false);
    }
  }

  const statusOrg = completedSteps.has('organization') ? 'Done' : 'Pending';
  const statusPlan = completedSteps.has('plan') ? 'Done' : 'Pending';
  const statusBrand = completedSteps.has('brand') ? 'Done' : 'Pending';
  const statusNode = completedSteps.has('node') ? 'Done' : 'Pending';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
      gap: isMobile ? 16 : 24,
      maxWidth: 1060,
      margin: isMobile ? '1rem auto' : '2.5rem auto',
      padding: isMobile ? '0 12px 32px' : '0 16px',
    }}>
      {/* Left panel */}
      <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: isMobile ? '22px 18px' : '28px 30px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4853A', marginBottom: 8 }}>
            Merchant Onboarding
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, margin: 0, color: '#1C1917', lineHeight: 1.2 }}>
            Set up the first brand and first node
          </h1>
          <p style={{ color: '#78716C', margin: '8px 0 0', fontSize: 13, lineHeight: 1.6 }}>
            Steps 1 to 7 now carry the merchant all the way from org creation to a completed first brand and kitchen setup.
          </p>
        </div>

        {/* Step grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 8,
          marginBottom: 18,
        }}>
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = completedSteps.has(step.id);
            return (
              <div
                key={step.id}
                style={{
                  border: `1px solid ${isActive ? '#1C1917' : isDone ? '#D1FAE5' : '#E7E5E4'}`,
                  borderRadius: 10,
                  background: isActive ? '#FAFAF9' : isDone ? '#F0FDF4' : '#FFFFFF',
                  padding: '10px 12px',
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: isDone ? '#DCFCE7' : isActive ? '#1C1917' : '#F5F5F4',
                    color: isDone ? '#166534' : isActive ? '#FFFFFF' : '#78716C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>
                    {isDone ? '✓' : step.num}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#1C1917' : '#57534E' }}>{step.label}</div>
              </div>
            );
          })}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <button type="button" onClick={goBack} disabled={stepIndex === 0} style={navBtnStyle(stepIndex === 0)}>Back</button>
          <button type="button" onClick={goForward} disabled={stepIndex === STEPS.length - 1} style={navBtnStyle(stepIndex === STEPS.length - 1)}>Forward</button>
          <button type="button" onClick={startOver} style={startOverBtnStyle}>Start over</button>
        </div>

        {error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        ) : null}

        {/* Step content */}
        {currentStep === 'organization' && (
          <div>
            <Field label="Organization Name">
              <input
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (!orgSlug) setOrgSlug(slugify(e.target.value));
                }}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Billing Email">
              <input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Primary Contact Name">
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Primary Address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 16 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Optional" style={inputStyle} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>State</span>
                <input value={orgState} onChange={(e) => setOrgState(e.target.value)} placeholder="Optional" style={inputStyle} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Zip Code</span>
                <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Optional" style={inputStyle} />
              </label>
            </div>
            <Field label="Storefront Slug">
              <input value={orgSlug} onChange={(e) => setOrgSlug(slugify(e.target.value))} required style={inputStyle} />
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>
                <code>{`order.trayloophq.com/${orgSlug || 'your-brand'}`}</code>
              </div>
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
            </Field>
          </div>
        )}

        {currentStep === 'model' && (
          <div>
            <p style={{ fontSize: 14, color: '#57534E', marginBottom: 16, lineHeight: 1.6 }}>
              Select the operating model that best fits this merchant's catering business.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {([
                { value: 'delivery', label: 'Delivery only', desc: 'Merchant delivers all catering orders to the customer location.' },
                { value: 'pickup', label: 'Pickup only', desc: 'Customers pick up their catering orders from the kitchen.' },
                { value: 'both', label: 'Delivery & Pickup', desc: 'Merchant offers both delivery and pickup options.' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOperatingModel(opt.value)}
                  style={{
                    width: '100%', textAlign: 'left', borderRadius: 12,
                    border: operatingModel === opt.value ? '2px solid #1C1917' : '1px solid #E7E5E4',
                    background: operatingModel === opt.value ? '#FAFAF9' : '#FFFFFF',
                    padding: '14px 16px', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{opt.label}</div>
                    <div style={{
                      width: 16, height: 16, borderRadius: 999,
                      border: operatingModel === opt.value ? '5px solid #1C1917' : '2px solid #D6D3D1',
                      background: '#FFFFFF', flexShrink: 0,
                    }} />
                  </div>
                  <div style={{ fontSize: 13, color: '#78716C', marginTop: 4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'plan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
              {PLAN_OPTIONS.map((plan) => {
                const pd = getMerchantPlanDisplay(plan)!;
                const selected = selectedPlan === plan;
                return (
                  <button key={plan} type="button" onClick={() => setSelectedPlan(plan)} style={{
                    width: '100%', textAlign: 'left', borderRadius: 14,
                    border: selected ? '2px solid #1C1917' : '1px solid #E7E5E4',
                    background: selected ? '#FAFAF9' : '#FFFFFF',
                    padding: '16px 14px', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>{pd.label}</div>
                        <div style={{ fontSize: 13, color: '#57534E', marginTop: 3 }}>{getMerchantPlanPriceLabel(plan)}</div>
                      </div>
                      <div style={{
                        width: 16, height: 16, borderRadius: 999, flexShrink: 0, marginTop: 2,
                        border: selected ? '5px solid #1C1917' : '2px solid #D6D3D1',
                        background: '#FFFFFF',
                      }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.55, marginBottom: 10 }}>{pd.description}</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {pd.highlights.slice(0, 4).map((h) => (
                        <div key={h} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#1C1917', marginTop: 1 }}>+</span>
                          <span style={{ fontSize: 11, color: '#57534E', lineHeight: 1.5 }}>{h}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {growthAdvisorEnabled ? (
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', border: `1px solid ${includeGrowthAdvisor ? '#1D7A55' : '#E7E5E4'}`, borderRadius: 12, padding: '14px 16px', background: includeGrowthAdvisor ? '#F0FDF4' : '#FFFFFF' }}>
                <input type="checkbox" checked={includeGrowthAdvisor} onChange={(e) => setIncludeGrowthAdvisor(e.target.checked)} style={{ marginTop: 3 }} />
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>Add Growth Advisor</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#1C1917', color: '#FAFAF9', borderRadius: 999, padding: '3px 8px' }}>+$99/mo</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.6 }}>AI-backed launch and catering growth guidance. Attached to the same subscription checkout.</div>
                </div>
              </label>
            ) : null}
          </div>
        )}

        {currentStep === 'payment' && (
          <div>
            <div style={{ padding: '16px 18px', borderRadius: 12, background: '#F5F5F4', border: '1px solid #E7E5E4', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>Stripe Connect — Payout account</div>
              <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
                After the workspace is created, Stripe Connect will be configured to enable payouts directly to this merchant's bank account. You will complete this step inside the onboarding dashboard after billing activates.
              </div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', lineHeight: 1.6 }}>
                Payment setup is completed after org creation. Billing must be active before the first payout can be enabled.
              </div>
            </div>
          </div>
        )}

        {currentStep === 'subscription' && (
          <div>
            <div style={{ padding: '16px 18px', borderRadius: 12, border: '1px solid #E7E5E4', background: '#FAFAF9', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Summary</div>
              <SummaryRow label="Organization" value={orgName || '—'} />
              <SummaryRow label="Contact" value={contactName || '—'} />
              <SummaryRow label="Email" value={billingEmail || '—'} />
              <SummaryRow label="Operating model" value={operatingModel === 'both' ? 'Delivery & Pickup' : operatingModel === 'delivery' ? 'Delivery only' : 'Pickup only'} />
              <SummaryRow label="Plan" value={`${getMerchantPlanDisplay(selectedPlan)?.label ?? ''} — ${getMerchantPlanPriceLabel(selectedPlan)}`} />
              {growthAdvisorEnabled && includeGrowthAdvisor ? <SummaryRow label="Growth Advisor" value="+$99/mo" /> : null}
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 13, color: '#92400E', fontWeight: 600, lineHeight: 1.55 }}>
              Clicking &ldquo;Create workspace and activate&rdquo; will register this merchant, then open secure billing checkout. Billing is active before brand and node are configured.
            </div>
          </div>
        )}

        {currentStep === 'brand' && (
          <div>
            <p style={{ fontSize: 14, color: '#57534E', marginBottom: 16, lineHeight: 1.6 }}>
              Set the brand color and display font for this merchant's storefront. These can be updated anytime from Settings.
            </p>
            <Field label="Brand Color">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid #D6D3D1', cursor: 'pointer', padding: 2 }} />
                <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Field>
            <Field label="Display Font">
              <select value={displayFont} onChange={(e) => setDisplayFont(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="bricolage">Bricolage Grotesque</option>
                <option value="fraunces">Fraunces</option>
                <option value="inter">Inter</option>
              </select>
            </Field>
            <div style={{ padding: '14px 16px', borderRadius: 12, background: '#F5F5F4', border: '1px solid #E7E5E4', marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>Brand preview</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: brandColor, lineHeight: 1.2 }}>{orgName || 'Your Brand'}</div>
              <div style={{ fontSize: 13, color: '#78716C', marginTop: 4 }}>Storefront header preview</div>
            </div>
          </div>
        )}

        {currentStep === 'node' && (
          <div>
            <p style={{ fontSize: 14, color: '#57534E', marginBottom: 16, lineHeight: 1.6 }}>
              Set up the first kitchen node. This is the primary location that will serve orders from the storefront.
            </p>
            <Field label="Kitchen Name">
              <input value={kitchenName} onChange={(e) => setKitchenName(e.target.value)} placeholder="e.g. Main Kitchen" style={inputStyle} />
            </Field>
            <Field label="Kitchen Address">
              <input value={kitchenAddress} onChange={(e) => setKitchenAddress(e.target.value)} placeholder="Street address" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 16 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>City</span>
                <input value={kitchenCity} onChange={(e) => setKitchenCity(e.target.value)} style={inputStyle} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>State</span>
                <input value={kitchenState} onChange={(e) => setKitchenState(e.target.value)} style={inputStyle} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Zip</span>
                <input value={kitchenZip} onChange={(e) => setKitchenZip(e.target.value)} style={inputStyle} />
              </label>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 13, color: '#166534', fontWeight: 600, lineHeight: 1.55 }}>
              Node details will be saved after billing checkout completes. You can also add or edit nodes from the onboarding dashboard.
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 22 }}>
          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            style={{ ...primaryBtnStyle, width: isMobile ? '100%' : undefined }}
          >
            {loading ? 'Please wait...' : STEP_CTA[currentStep]}
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: '#78716C' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </section>

      {/* Right panel – STATUS */}
      <aside style={{
        border: '1px solid #2C2724',
        borderRadius: 16,
        background: '#1C1917',
        color: '#FAFAF9',
        padding: isMobile ? '22px 18px' : '28px 26px',
        alignSelf: 'start',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4853A', marginBottom: 12 }}>
          Status
        </div>
        <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.25 }}>
          The flow now finishes the first live setup
        </h2>
        <p style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.7, margin: '0 0 20px' }}>
          Billing is active before the first brand and node are created, and the welcome email fires when onboarding is complete.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <StatusCard label="Organization" value={statusOrg} />
          <StatusCard label="Plan" value={statusPlan} />
          <StatusCard label="Brand Preview" value={statusBrand} />
          <StatusCard label="Kitchen" value={statusNode} />
        </div>

        <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAF9', marginBottom: 6 }}>Step {stepIndex + 1} of 7</div>
          <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>
            {STEPS[stepIndex].label} — {stepIndex < STEPS.length - 1 ? `Next: ${STEPS[stepIndex + 1].label}` : 'Final step'}
          </div>
        </div>
      </aside>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  const isDone = value === 'Done';
  return (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#231F1C', border: '1px solid #2C2724' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#78716C', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: isDone ? '#86EFAC' : '#FAFAF9' }}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid #E7E5E4' }}>
      <span style={{ fontSize: 12, color: '#78716C', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1C1917', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 14px', borderRadius: 8,
    border: '1px solid #D6D3D1', background: '#FFFFFF',
    color: disabled ? '#C4C4C4' : '#57534E',
    fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

const startOverBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px 14px', borderRadius: 8,
  border: '1px solid #E85618', background: '#FFFFFF',
  color: '#E85618', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '11px 18px', borderRadius: 10,
  border: 'none', background: '#1C1917',
  color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: 8, border: '1px solid #D6D3D1',
  background: '#FFFFFF', padding: '9px 12px',
  fontSize: 14, color: '#1C1917', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: '#78716C', marginBottom: 5,
};
