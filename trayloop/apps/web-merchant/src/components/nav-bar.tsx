'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NotificationBell from './notification-bell';
import { clearMerchantSession } from '../lib/session';
import { getStorefrontUrl } from '../lib/storefront';
import { apiFetch } from '../lib/api';

export default function NavBar() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const orgSlug = localStorage.getItem('orgSlug');
    setSignedIn(Boolean(token));
    setStorefrontUrl(orgSlug ? getStorefrontUrl(orgSlug) : null);

    if (token && !orgSlug) {
      apiFetch('/api/organizations/current/setup-status')
        .then((res) => {
          if (res.data?.slug) {
            localStorage.setItem('orgSlug', res.data.slug);
            setStorefrontUrl(getStorefrontUrl(res.data.slug));
          }
        })
        .catch(() => {});
    }
  }, [pathname]);

  function handleSignOut() {
    clearMerchantSession();
    window.location.href = '/login';
  }

  return (
    <nav style={{
      background: '#1C1917',
      padding: '0 24px',
      height: 52,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <a href="/" style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', textDecoration: 'none' }}>
        TrayLoop
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, fontWeight: 500 }}>
        {isAuthPage ? (
          <>
            <a href="/login" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Sign In</a>
            <a href="/register" style={{ color: '#D4A853', textDecoration: 'none' }}>Create Account</a>
          </>
        ) : (
          <>
            <a href="/" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Orders</a>
            <a href="/follow-ups" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Follow-Ups</a>
            <a href="/customers" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Customers</a>
            <a href="/catalog" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Offerings</a>
            <a href="/settings" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Setup</a>
            {storefrontUrl ? (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#D4A853', textDecoration: 'none' }}
              >
                View Storefront
              </a>
            ) : null}
            <NotificationBell />
            {signedIn ? (
              <button
                onClick={handleSignOut}
                style={{
                  background: 'transparent',
                  border: '1px solid #44403C',
                  borderRadius: 9999,
                  color: '#FAFAF9',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                }}
              >
                Sign Out
              </button>
            ) : null}
          </>
        )}
      </div>
    </nav>
  );
}
