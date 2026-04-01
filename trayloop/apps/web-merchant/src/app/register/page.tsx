'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const [step, setStep] = useState<'account' | 'org'>('account');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Account fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Org fields
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgPhone, setOrgPhone] = useState('');

  const [token, setToken] = useState('');

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Registration failed');

      setToken(json.data.token);
      setStep('org');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: orgName,
          slug: orgSlug,
          phone: orgPhone || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Failed to create organization');

      // Store auth and redirect to dashboard
      localStorage.setItem('token', token);
      localStorage.setItem('orgId', json.data.id);
      localStorage.setItem('orgSlug', orgSlug);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {step === 'account' ? 'Create Your Account' : 'Set Up Your Business'}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        {step === 'account'
          ? 'Start by creating your merchant account.'
          : 'Now let\'s create your organization.'}
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#111827' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: step === 'org' ? '#111827' : '#e5e7eb' }} />
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

      {step === 'account' && (
        <form onSubmit={handleAccountSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password (min 8 characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.6rem', background: '#111827', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Continue'}
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
            Already have an account? <a href="/login" style={{ color: '#2563eb' }}>Sign in</a>
          </p>
        </form>
      )}

      {step === 'org' && (
        <form onSubmit={handleOrgSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Business Name</label>
            <input value={orgName} onChange={(e) => { setOrgName(e.target.value); if (!orgSlug) setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>URL Slug</label>
            <input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Your storefront: trayloop.com/{orgSlug || '...'}
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Phone (optional)</label>
            <input type="tel" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.6rem', background: '#111827', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      )}
    </div>
  );
}
