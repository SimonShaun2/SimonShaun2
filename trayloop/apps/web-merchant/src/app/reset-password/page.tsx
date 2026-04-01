'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MerchantResetPasswordPage() {
  return (
    <Suspense fallback={<ResetShell title="Reset password" subtitle="Loading merchant reset flow..." />}>
      <MerchantResetPasswordContent />
    </Suspense>
  );
}

function MerchantResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const mode = token ? 'confirm' : 'request';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmitConfirm = useMemo(
    () => password.length >= 8 && password === confirmPassword,
    [password, confirmPassword],
  );

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, app: 'merchant' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Unable to send reset link');
      setSuccess('If that merchant account exists, a reset link is on its way.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmitConfirm) {
      setError('Passwords must match and be at least 8 characters');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, app: 'merchant' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Unable to reset password');
      setSuccess('Password updated. You can sign in with your new password now.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetShell
      title={mode === 'confirm' ? 'Choose a new password' : 'Reset password'}
      subtitle={mode === 'confirm'
        ? 'Set a new merchant password for your account.'
        : "We'll email a reset link to your merchant account."}
    >
      {error ? <Notice color="#DC2626" background="#FEF2F2" border="#FECACA" message={error} /> : null}
      {success ? <Notice color="#047857" background="#ECFDF5" border="#A7F3D0" message={success} /> : null}

      {mode === 'confirm' ? (
        <form onSubmit={handleConfirm} style={{ marginTop: 18 }}>
          <Label>Password</Label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={fieldStyle} />
          <Label style={{ marginTop: 14 }}>Confirm password</Label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={fieldStyle} />
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequest} style={{ marginTop: 18 }}>
          <Label>Email</Label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={fieldStyle} />
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p style={{ margin: '18px 0 0', fontSize: 14, color: '#78716C' }}>
        Back to <Link href="/login" style={linkStyle}>merchant sign in</Link>
      </p>
    </ResetShell>
  );
}

function ResetShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <main
      style={{
        maxWidth: 420,
        margin: '4rem auto',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h1>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 0, marginBottom: '1.5rem' }}>{subtitle}</p>
      {children}
    </main>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', ...style }}>
      {children}
    </label>
  );
}

function Notice({
  color,
  background,
  border,
  message,
}: {
  color: string;
  background: string;
  border: string;
  message: string;
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        color,
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  background: '#111827',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontWeight: 700,
  marginTop: '1rem',
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 600,
};
