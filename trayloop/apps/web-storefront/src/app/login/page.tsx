'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginCustomer } from '../../lib/api';
import { clearCustomerSession, customerResetHref, getCustomerToken, setCustomerSession } from '../../lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<AuthPageFallback title="Sign in" subtitle="Loading customer sign-in..." />}>
      <CustomerLoginContent />
    </Suspense>
  );
}

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    setHasExistingSession(Boolean(getCustomerToken()));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await loginCustomer(email, password);
      setCustomerSession(result.token);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutCurrentSession() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch {
      // Best effort logout.
    }
    clearCustomerSession();
    setHasExistingSession(false);
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
      <div style={{ width: '100%', maxWidth: 420 }}>
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
            <div style={{ fontSize: 13, color: '#D6D3D1' }}>Customer Sign In</div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 32,
          border: '1px solid #E7E5E4',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1C1917' }}>Sign in</h1>
          <p style={{ margin: '8px 0 0', color: '#78716C', fontSize: 14 }}>
            Access faster repeat orders and your order history.
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
              Email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              style={fieldStyle}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#44403C', margin: '16px 0 6px' }}>
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              style={fieldStyle}
            />

            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12 }}>
            <a href={customerResetHref()} style={helperLinkStyle}>Reset password</a>
            {hasExistingSession && (
              <button type="button" onClick={handleSignOutCurrentSession} style={secondaryButtonStyle}>
                Sign out current session
              </button>
            )}
          </div>

          <p style={{ margin: '18px 0 0', fontSize: 14, color: '#78716C' }}>
            New customer? <Link href="/signup" style={helperLinkStyle}>Create an account</Link>
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
        maxWidth: 420,
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

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#1C1917',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const helperLinkStyle: React.CSSProperties = {
  color: '#B45309',
  textDecoration: 'none',
  fontWeight: 600,
};
