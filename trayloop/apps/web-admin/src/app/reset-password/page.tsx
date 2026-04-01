'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<ResetShell title="Reset password" subtitle="Loading admin reset flow..." />}>
      <AdminResetPasswordContent />
    </Suspense>
  );
}

function AdminResetPasswordContent() {
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
        body: JSON.stringify({ email, app: 'admin' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Unable to send reset link');
      setSuccess('If that admin account exists, a reset link is on its way.');
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
        body: JSON.stringify({ token, password, app: 'admin' }),
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
      title={mode === 'confirm' ? 'Choose a new admin password' : 'Reset admin password'}
      subtitle={mode === 'confirm' ? 'Set a new password for your admin account.' : 'We’ll email a secure reset link to your admin account.'}
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
        Back to <Link href="/login" style={linkStyle}>admin sign in</Link>
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1C1917',
        padding: 24,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: '#FAFAF9', borderRadius: 12, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 4, color: '#1C1917' }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 24 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#44403C', ...style }}>
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
    <div style={{ background, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color, fontWeight: 500 }}>
      {message}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #D6D3D1',
  borderRadius: 6,
  boxSizing: 'border-box',
  fontSize: 14,
  outline: 'none',
  background: '#FFFFFF',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: '#1C1917',
  color: '#FAFAF9',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  marginTop: 16,
};

const linkStyle: React.CSSProperties = {
  color: '#2563EB',
  textDecoration: 'none',
  fontWeight: 600,
};
