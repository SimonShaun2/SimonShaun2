'use client';

import { useEffect, useState } from 'react';
import { clearMerchantSession, merchantResetHref } from '../../lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    setHasExistingSession(Boolean(localStorage.getItem('token')));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Login failed');

      localStorage.setItem('token', json.data.token);
      if (json.data.organizations?.length > 0) {
        localStorage.setItem('orgId', json.data.organizations[0].id);
        localStorage.setItem('orgSlug', json.data.organizations[0].slug);
        window.location.href = '/';
      } else {
        // No orgs - redirect to create one
        window.location.href = '/register?step=org';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSignOutCurrentSession() {
    clearMerchantSession();
    setHasExistingSession(false);
    setError('');
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sign in to your dashboard</h1>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 0, marginBottom: '1.5rem' }}>
        Manage orders, menus, and customers
      </p>
      {error ? (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ color: '#DC2626', fontSize: '1rem', flexShrink: 0 }}>!</span>
          <p style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1rem', fontSize: '0.8rem', gap: '0.75rem' }}>
          <a href={merchantResetHref()} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Reset password
          </a>
          {hasExistingSession ? (
            <button
              type="button"
              onClick={handleSignOutCurrentSession}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
            >
              Sign out current session
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.6rem', background: '#111827', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
        New merchant? <a href="/register" style={{ color: '#2563eb' }}>Create an account</a>
      </p>
    </div>
  );
}
