'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMobile } from '../../lib/use-mobile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Step = 'account' | 'workspace';

export default function RegisterPage() {
  return (
    <Suspense fallback={<p style={{ color: '#78716C' }}>Loading...</p>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const isMobile = useMobile(900);
  const existingMerchant = searchParams.get('step') === 'org';
  const [step, setStep] = useState<Step>(existingMerchant ? 'workspace' : 'account');
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
    if (typeof window === 'undefined') return;
    if (existingMerchant) setToken(localStorage.getItem('token') ?? '');
  }, [existingMerchant]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!existingMerchant && step === 'account') {
      if (!name.trim() || !email.trim() || password.length < 8) {
        setError('Fill in all fields. Password must be at least 8 characters.');
        return;
      }
      setStep('workspace');
      return;
    }

    setLoading(true);
    try {
      const usingExistingSession = Boolean(token);
      const response = await fetch(
        usingExistingSession
          ? `${API_URL}/api/organizations`
          : `${API_URL}/api/auth/register/merchant-workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(usingExistingSession ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            usingExistingSession
              ? { name: orgName.trim(), slug: orgSlug.trim(), phone: orgPhone.trim() || undefined }
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
      if (!response.ok) throw new Error(json.error?.message ?? 'Failed to create workspace');

      const nextToken = usingExistingSession ? token : json.data.token;
      const organization = usingExistingSession ? json.data : json.data.organization;

      localStorage.setItem('token', nextToken);
      localStorage.setItem('orgId', organization.id);
      localStorage.setItem('orgSlug', organization.slug ?? orgSlug.trim());
      localStorage.setItem('orgName', organization.name ?? orgName.trim());
      window.location.href = '/onboarding?welcome=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(280px, 360px)',
      gap: isMobile ? 16 : 24,
      maxWidth: 960,
      margin: isMobile ? '1rem auto' : '2.5rem auto',
      padding: isMobile ? '0 12px 24px' : '0 16px',
    }}>
      <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: isMobile ? '22px 18px' : '28px 30px' }}>
        <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, margin: 0, color: '#1C1917', lineHeight: 1.15 }}>
          {existingMerchant ? 'Set up your business' : step === 'account' ? 'Create your account' : 'Set up your business'}
        </h1>
        <p style={{ color: '#78716C', margin: '8px 0 24px', fontSize: 14, lineHeight: 1.6 }}>
          {existingMerchant
            ? 'Add your business details to get your storefront ready.'
            : step === 'account'
              ? 'Start with your login, then add your business details.'
              : 'Almost there — tell us about your business.'}
        </p>

        {!existingMerchant && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <StepPill active={step === 'account'} done={step === 'workspace'} label="1. Your account" />
            <StepPill active={step === 'workspace'} done={false} label="2. Your business" />
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 500 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 'account' && !existingMerchant && (
            <>
              <Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Rivera" style={inputStyle} /></Field>
              <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" style={inputStyle} /></Field>
              <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" style={inputStyle} /></Field>
              <button type="submit" style={primaryBtnStyle}>Continue</button>
            </>
          )}

          {(step === 'workspace' || existingMerchant) && (
            <>
              <Field label="Business name">
                <input value={orgName} onChange={(e) => { setOrgName(e.target.value); if (!orgSlug) setOrgSlug(slugify(e.target.value)); }} required placeholder="Circle's Deli" style={inputStyle} />
              </Field>
              <Field label="Storefront URL">
                <input value={orgSlug} onChange={(e) => setOrgSlug(slugify(e.target.value))} required placeholder="circles-deli" style={inputStyle} />
                <div style={{ fontSize: 12, color: '#78716C', marginTop: 6 }}>order.trayloophq.com/<strong>{orgSlug || 'your-brand'}</strong></div>
              </Field>
              <Field label="Business phone (optional)">
                <input type="tel" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} placeholder="(555) 123-4567" style={inputStyle} />
              </Field>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!existingMerchant && <button type="button" onClick={() => setStep('account')} style={secondaryBtnStyle}>Back</button>}
                <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating...' : 'Launch my storefront'}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: '#78716C' }}>
          Already have an account? <a href="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </section>

      <aside style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#1C1917', color: '#FAFAF9', padding: isMobile ? '22px 18px' : '28px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#D4A853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#1C1917' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>TrayLoop</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.2 }}>Everything you need to sell catering online</h2>
        <p style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6, margin: '0 0 20px' }}>Create your account, set up your menu, and start accepting orders in minutes.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <SideItem icon="1" title="Create your account" body="Set up your login and business profile." />
          <SideItem icon="2" title="Build your menu" body="Add packages, add-ons, and set pricing per headcount." />
          <SideItem icon="3" title="Go live" body="Share your storefront link and start taking catering orders." />
        </div>
        <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: '#231F1C', border: '1px solid #2C2724' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A853', marginBottom: 4 }}>Free to start</div>
          <div style={{ fontSize: 13, color: '#D6D3D1', lineHeight: 1.6 }}>Try TrayLoop free for 30 days. No credit card required. Start billing when you're ready.</div>
        </div>
      </aside>
    </div>
  );
}

function StepPill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: done ? '#DCFCE7' : active ? '#1C1917' : '#F5F5F4', color: done ? '#166534' : active ? '#FFFFFF' : '#78716C', textAlign: 'center' }}>
      {done ? '✓ ' : ''}{label}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#44403C', marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

function SideItem({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#292524', color: '#D4A853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAF9', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#A8A29E', lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 8, border: '1px solid #D6D3D1', background: '#FFFFFF', padding: '10px 12px', fontSize: 14, color: '#1C1917', boxSizing: 'border-box', outline: 'none' };
const primaryBtnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 20px', borderRadius: 8, border: 'none', background: '#1C1917', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const secondaryBtnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 20px', borderRadius: 8, border: '1px solid #D6D3D1', background: '#FFFFFF', color: '#57534E', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
