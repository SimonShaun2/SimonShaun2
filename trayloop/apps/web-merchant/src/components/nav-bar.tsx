'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NotificationBell from './notification-bell';
import { clearMerchantSession } from '../lib/session';
import { apiFetch, fetchStorefrontContext, type MerchantStorefrontContext } from '../lib/api';
import { automationsEnabled } from '../lib/features';
import { useMobile } from '../lib/use-mobile';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', section: 'workspace' },
  { href: '/billing', label: 'Billing', section: 'workspace' },
  { href: '/onboarding', label: 'Launch Setup', section: 'workspace' },
  { href: '/follow-ups', label: 'Follow-Ups', section: 'workspace' },
  { href: '/automations', label: 'Automations', section: 'workspace' },
  { href: '/revenue-intelligence', label: 'Revenue', section: 'workspace' },
  { href: '/customers', label: 'Customers', section: 'workspace' },
  { href: '/catalog', label: 'Offerings', section: 'workspace' },
  { href: '/settings', label: 'Settings', section: 'configure' },
];

const VISIBLE_NAV_ITEMS = automationsEnabled
  ? NAV_ITEMS
  : NAV_ITEMS.filter((item) => item.href !== '/automations');

export default function NavBar() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/reset-password';
  const isMobile = useMobile();
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [defaultLocationName, setDefaultLocationName] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthPage) return;

    const token = localStorage.getItem('token');
    const storedOrgName = localStorage.getItem('orgName');
    setSignedIn(Boolean(token));
    setOrgName(storedOrgName);
    setStorefrontUrl(null);
    setDefaultLocationName(null);

    if (token) {
      Promise.all([
        apiFetch('/api/organizations/current').catch(() => null),
        fetchStorefrontContext().catch(() => null),
      ])
        .then(([orgRes, storefrontContext]) => {
          if (orgRes?.data?.name) {
            localStorage.setItem('orgName', orgRes.data.name);
            setOrgName(orgRes.data.name);
          }

          const context = storefrontContext as MerchantStorefrontContext | null;
          if (context) {
            localStorage.setItem('orgSlug', context.organization.slug);
            setStorefrontUrl(context.storefrontUrl);
            setDefaultLocationName(context.defaultLocationName);
            if (!orgRes?.data?.name) {
              localStorage.setItem('orgName', context.organization.name);
              setOrgName(context.organization.name);
            }
          } else {
            setStorefrontUrl(null);
            setDefaultLocationName(null);
          }
        })
        .catch(() => {});
    }
  }, [isAuthPage, pathname]);

  function handleSignOut() {
    clearMerchantSession();
    window.location.href = '/login';
  }

  if (isAuthPage) return null;

  if (isMobile) {
    return (
      <aside
        style={{
          width: '100%',
          background: '#1C1917',
          color: '#FAFAF9',
          display: 'flex',
          flexDirection: 'column',
          borderBottom: '1px solid #292524',
        }}
      >
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#FAFAF9', minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#D4A853',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1C1917',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                TL
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>TrayLoop</div>
                <div style={{ fontSize: 12, color: '#E7E5E4', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {orgName ?? 'Merchant Dashboard'}
                </div>
              </div>
            </a>
            <NotificationBell />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {storefrontUrl ? (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  background: '#D4A853',
                  color: '#1C1917',
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Open Storefront
              </a>
            ) : null}
            {signedIn ? (
              <button
                onClick={handleSignOut}
                style={{
                  border: '1px solid #44403C',
                  borderRadius: 999,
                  background: 'transparent',
                  color: '#FAFAF9',
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '0 16px 16px',
          }}
        >
          {VISIBLE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(212, 168, 83, 0.12)' : '#231F1C',
                  color: isActive ? '#D4A853' : '#D6D3D1',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid rgba(212, 168, 83, 0.35)' : '1px solid #2C2724',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 236,
        background: '#1C1917',
        color: '#FAFAF9',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: '100vh',
      }}
    >
      <div style={{ padding: '20px 18px 16px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#FAFAF9' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: '#D4A853',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1C1917',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            TL
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>TrayLoop</div>
            <div style={{ fontSize: 12, color: '#E7E5E4', fontWeight: 600, marginTop: 2 }}>
              {orgName ?? 'Merchant Dashboard'}
            </div>
            <div style={{ fontSize: 11, color: '#A8A29E' }}>Merchant Dashboard</div>
          </div>
        </a>
      </div>

      <div style={{ padding: '0 18px 12px' }}>
        <div
          style={{
            border: '1px solid #2C2724',
            borderRadius: 12,
            padding: '10px 12px',
            background: '#231F1C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storefront</div>
              <div style={{ fontSize: 12, color: '#D6D3D1', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {storefrontUrl ?? 'Link available after setup'}
              </div>
              {defaultLocationName ? (
                <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>
                  Default location: {defaultLocationName}
                </div>
              ) : null}
            </div>
            <NotificationBell />
          </div>
          {storefrontUrl ? (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                background: '#D4A853',
                color: '#1C1917',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open Storefront
            </a>
          ) : null}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {(['workspace', 'configure'] as const).map((section) => (
          <div key={section} style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#78716C',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '10px 8px 6px',
              }}
            >
              {section === 'workspace' ? 'Workspace' : 'Configure'}
            </div>
            {VISIBLE_NAV_ITEMS.filter((item) => item.section === section).map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    marginBottom: 4,
                    background: isActive ? 'rgba(212, 168, 83, 0.12)' : 'transparent',
                    color: isActive ? '#D4A853' : '#D6D3D1',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: isActive ? '#D4A853' : '#44403C',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {item.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px 18px', borderTop: '1px solid #292524' }}>
        <div style={{ fontSize: 12, color: '#A8A29E', marginBottom: 10 }}>Signed in merchant workspace</div>
        {signedIn ? (
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 10,
              border: '1px solid #44403C',
              background: 'transparent',
              color: '#FAFAF9',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </aside>
  );
}
