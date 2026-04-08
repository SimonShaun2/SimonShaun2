'use client';

import { useMemo, useState } from 'react';
import { createAdminTestAccount, type AdminTestAccountResult } from '../../lib/api';

const MERCHANT_APP_URL = process.env.NEXT_PUBLIC_MERCHANT_URL || 'https://dashboard.trayloophq.com';
const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://order.trayloophq.com';
const ADMIN_APP_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://master.trayloophq.com';
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'production';

type Role = 'merchant' | 'customer' | 'admin';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function TestAccountsPage() {
  const [role, setRole] = useState<Role>('merchant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AdminTestAccountResult | null>(null);

  const suggestedOrganizationSlug = useMemo(() => slugify(organizationName || `${name} Test Workspace`), [name, organizationName]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const created = await createAdminTestAccount({
        role,
        name,
        email: email || undefined,
        password: password || undefined,
        organizationName: role === 'merchant' ? (organizationName || `${name} Test Workspace`) : undefined,
        organizationSlug: role === 'merchant' ? (organizationSlug || suggestedOrganizationSlug) : undefined,
        companyName: role === 'customer' ? (companyName || undefined) : undefined,
      });
      setResult(created);
      if (!email) setEmail(created.email);
      if (!password) setPassword(created.password);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create test account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Test Accounts</h1>
        <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>
          Create merchant, customer, or admin test identities in the current {APP_ENV} environment.
        </p>
      </div>

      <div
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: 14,
          background: '#FFFBEB',
          padding: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Environment Note
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
          This tool creates accounts in whichever admin environment you are logged into. Use the staging admin app to make staging test accounts, and the production admin app only when you intentionally want production test identities.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <form
          onSubmit={handleCreate}
          style={{
            border: '1px solid #E7E5E4',
            borderRadius: 14,
            background: '#FFFFFF',
            padding: 24,
            display: 'grid',
            gap: 16,
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={labelStyle}>Account type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['merchant', 'customer', 'admin'] as Role[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: role === option ? '1px solid #1C1917' : '1px solid #D6D3D1',
                    background: role === option ? '#1C1917' : '#FFFFFF',
                    color: role === option ? '#FAFAF9' : '#44403C',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="name" style={labelStyle}>Display name</label>
            <input id="name" required value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} placeholder="Nonnie Test Merchant" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label htmlFor="email" style={labelStyle}>Email override</label>
              <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} placeholder="Optional" />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label htmlFor="password" style={labelStyle}>Password override</label>
              <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} placeholder="Optional" />
            </div>
          </div>

          {role === 'merchant' ? (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label htmlFor="organizationName" style={labelStyle}>Workspace name</label>
                <input
                  id="organizationName"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  style={inputStyle}
                  placeholder={`${name || 'Merchant'} Test Workspace`}
                />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label htmlFor="organizationSlug" style={labelStyle}>Workspace slug</label>
                <input
                  id="organizationSlug"
                  value={organizationSlug}
                  onChange={(event) => setOrganizationSlug(event.target.value)}
                  style={inputStyle}
                  placeholder={suggestedOrganizationSlug || 'merchant-test-workspace'}
                />
              </div>
            </>
          ) : null}

          {role === 'customer' ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <label htmlFor="companyName" style={labelStyle}>Company name</label>
              <input id="companyName" value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} placeholder="Optional" />
            </div>
          ) : null}

          {error ? (
            <div style={{ borderRadius: 10, background: '#FEF2F2', color: '#B91C1C', padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              border: 'none',
              borderRadius: 10,
              background: '#1C1917',
              color: '#FAFAF9',
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating test account...' : 'Create test account'}
          </button>
        </form>

        <div
          style={{
            border: '1px solid #E7E5E4',
            borderRadius: 14,
            background: '#FFFFFF',
            padding: 24,
            minHeight: 280,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>Latest account</h2>
          {!result ? (
            <p style={{ margin: 0, fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>
              Create an account and the generated credentials will appear here, along with quick links for the onboarding team.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              <CredentialRow label="Role" value={result.role} />
              <CredentialRow label="Email" value={result.email} />
              <CredentialRow label="Password" value={result.password} monospace />
              {result.organization ? <CredentialRow label="Workspace" value={`${result.organization.name} (${result.organization.slug})`} /> : null}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                <a href={`${MERCHANT_APP_URL}/login`} target="_blank" rel="noreferrer" style={primaryLinkStyle}>
                  Merchant Login
                </a>
                {result.role === 'admin' ? (
                  <a href={`${ADMIN_APP_URL}/login`} target="_blank" rel="noreferrer" style={secondaryLinkStyle}>
                    Admin Login
                  </a>
                ) : null}
                {result.organization ? (
                  <>
                    <a href={`${MERCHANT_APP_URL}/support-access?orgId=${encodeURIComponent(result.organization.id)}&orgSlug=${encodeURIComponent(result.organization.slug)}&orgName=${encodeURIComponent(result.organization.name)}&target=%2Fonboarding`} target="_blank" rel="noreferrer" style={secondaryLinkStyle}>
                      Launch Setup
                    </a>
                    <a href={`${MERCHANT_APP_URL}/support-access?orgId=${encodeURIComponent(result.organization.id)}&orgSlug=${encodeURIComponent(result.organization.slug)}&orgName=${encodeURIComponent(result.organization.name)}&target=%2Fcatalog`} target="_blank" rel="noreferrer" style={secondaryLinkStyle}>
                      Menu Editor
                    </a>
                    <a href={`${STOREFRONT_URL}/${result.organization.slug}`} target="_blank" rel="noreferrer" style={secondaryLinkStyle}>
                      Storefront
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CredentialRow({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#1C1917', fontFamily: monospace ? 'monospace' : 'inherit', wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#44403C',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #D6D3D1',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 14,
  outline: 'none',
  background: '#FFFFFF',
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '9px 12px',
  borderRadius: 10,
  background: '#1C1917',
  color: '#FAFAF9',
  fontSize: 12,
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryLinkStyle: React.CSSProperties = {
  ...primaryLinkStyle,
  background: '#FFFFFF',
  color: '#44403C',
  border: '1px solid #D6D3D1',
};
