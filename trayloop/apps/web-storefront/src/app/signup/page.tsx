'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerCustomer } from '../../lib/api';
import { setCustomerSession } from '../../lib/session';

export default function CustomerSignupPage() {
  return (
    <Suspense fallback={<AuthPageFallback title="Create account" subtitle="Loading account setup..." />}>
      <CustomerSignupContent />
    </Suspense>
  );
}

function CustomerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/account';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await registerCustomer({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        companyName: companyName || undefined,
      });
      setCustomerSession(result.token);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#1C1917',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FFFFFF', marginBottom: 28 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#D4A853',
            color: '#1C1917',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}>
            TL
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>TrayLoop</div>
            <div style={{ fontSize: 13, color: '#D6D3D1' }}>Customer Account</div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 32,
          border: '1px solid #E7E5E4',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1C1917' }}>Create account</h1>
          <p style={{ margin: '8px 0 0', color: '#78716C', fontSize: 14 }}>
            Save your details and make repeat catering orders faster.
          </p>

          {error && (
            <div style={{
              marginTop: 18,
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} required style={fieldStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} style={fieldStyle} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Company</label>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={fieldStyle} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={fieldStyle} />
            </div>

            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ margin: '18px 0 0', fontSize: 14, color: '#78716C' }}>
            Already have an account? <Link href="/login" style={helperLinkStyle}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function AuthPageFallback({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#1C1917',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        border: '1px solid #E7E5E4',
      }}>
        <h1 style={{ margin: 0, fontSize: 28, color: '#1C1917' }}>{title}</h1>
        <p style={{ margin: '8px 0 0', color: '#78716C', fontSize: 14 }}>{subtitle}</p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#44403C',
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 46,
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  padding: '0 14px',
  fontSize: 14,
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  borderRadius: 10,
  border: 'none',
  background: '#1C1917',
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: 700,
  marginTop: 22,
  cursor: 'pointer',
};

const helperLinkStyle: React.CSSProperties = {
  color: '#B45309',
  textDecoration: 'none',
  fontWeight: 600,
};
