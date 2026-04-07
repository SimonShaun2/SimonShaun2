'use client';

import { useEffect, useState } from 'react';
import { identifyAnalytics, trackEvent } from '@trayloop/analytics';
import { clearAdminSession, hasAdminSession, markAdminSession } from '../../lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_RESET_HREF = '/reset-password';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    setHasExistingSession(hasAdminSession());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    trackEvent('admin_login_started', { email });
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Login failed');
      if (json.data.user.role !== 'admin') throw new Error('Access denied - admin role required');
      markAdminSession();
      identifyAnalytics(json.data.user.id, {
        email: json.data.user.email,
        role: json.data.user.role,
      });
      trackEvent('admin_login_succeeded', { role: json.data.user.role });
      window.location.href = '/';
    } catch (err) {
      trackEvent('admin_login_failed', {
        email,
        message: err instanceof Error ? err.message : 'unknown_error',
      });
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSignOutCurrentSession() {
    clearAdminSession();
    setHasExistingSession(false);
    setError('');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1C1917',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#D4A853',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#1C1917',
              }}
            >
              TL
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#FAFAF9' }}>TrayLoop</span>
          </div>
          <p style={{ color: '#78716C', fontSize: 13, margin: 0 }}>Platform Administration</p>
        </div>

        <div
          style={{
            background: '#FAFAF9',
            borderRadius: 12,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 4, color: '#1C1917' }}>Sign in</h1>
          <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 24 }}>Access requires an admin account</p>

          {error ? (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#DC2626',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#44403C' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@trayloop.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #D6D3D1',
                  borderRadius: 6,
                  boxSizing: 'border-box',
                  fontSize: 14,
                  outline: 'none',
                  background: '#FFFFFF',
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#44403C' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #D6D3D1',
                  borderRadius: 6,
                  boxSizing: 'border-box',
                  fontSize: 14,
                  outline: 'none',
                  background: '#FFFFFF',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12 }}>
              <a href={ADMIN_RESET_HREF} style={{ color: '#2563EB', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
                Reset password
              </a>
              {hasExistingSession ? (
                <button
                  type="button"
                  onClick={handleSignOutCurrentSession}
                  style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', fontSize: 12, padding: 0 }}
                >
                  Sign out current session
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#1C1917',
                color: '#FAFAF9',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 600,
                fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
