'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CustomerResetPasswordPage() {
  return (
    <Suspense fallback={<ResetShell title="Reset password" subtitle="Loading customer reset flow..." />}>
      <CustomerResetPasswordContent />
    </Suspense>
  );
}

function CustomerResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const mode = token ? 'confirm' : 'request';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmitConfirm = useMemo(() => password.length >= 8 && password === confirmPassword, [password, confirmPassword]);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, app: 'customer' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Unable to send reset link');
      setSuccess('If that customer account exists, a reset link is on its way.');
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
        body: JSON.stringify({ token, password, app: 'customer' }),
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
      subtitle={mode === 'confirm' ? 'Set a new customer password for your TrayLoop account.' : 'We’ll email a secure reset link to your customer account.'}
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
        Back to <Link href="/login" style={linkStyle}>customer sign in</Link>
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
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 32,
          border: '1px solid #E7E5E4',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1C1917' }}>{title}</h1>
          <p style={{ margin: '8px 0 0', color: '#78716C', fontSize: 14 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#44403C', marginBottom: 6, ...style }}>
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
    <div style={{ marginTop: 18, background, color, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, fontWeight: 600 }}>
      {message}
    </div>
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

const linkStyle: React.CSSProperties = {
  color: '#B45309',
  textDecoration: 'none',
  fontWeight: 600,
};
