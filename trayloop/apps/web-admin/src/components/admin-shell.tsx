'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMobile } from '../lib/use-mobile';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: 'O', section: 'views' },
  { href: '/organizations', label: 'Restaurants', icon: 'R', section: 'views' },
  { href: '/users', label: 'Users', icon: 'U', section: 'views' },
  { href: '/trial-conversions', label: 'Trial Conversions', icon: 'T', section: 'intelligence' },
  { href: '/mrr-movement', label: 'MRR Movement', icon: 'M', section: 'intelligence' },
  { href: '/revenue-intelligence', label: 'Revenue Intelligence', icon: 'I', section: 'intelligence' },
  { href: '/automation-intelligence', label: 'Automation', icon: 'A', section: 'intelligence' },
  { href: '/platform-health', label: 'Platform Health', icon: 'H', section: 'intelligence' },
  { href: '/revenue-forecast', label: 'Revenue Forecast', icon: 'F', section: 'intelligence' },
  { href: '/churn-risk', label: 'Churn Risk', icon: 'C', section: 'intelligence' },
];

function useAdminAuth() {
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  return { checked, authenticated };
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/reset-password';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AuthenticatedShell pathname={pathname}>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { checked, authenticated } = useAdminAuth();
  const isMobile = useMobile();

  if (!checked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAF9F7' }}>
        <p style={{ color: '#78716C', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    );
  }

  if (!authenticated) return null;

  function handleLogout() {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <aside
        style={{
          width: isMobile ? '100%' : 220,
          background: '#1C1917',
          color: '#FAFAF9',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderBottom: isMobile ? '1px solid #292524' : 'none',
        }}
      >
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#D4A853',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#1C1917',
                }}
              >
                TL
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>TrayLoop</span>
            </div>
            {isMobile ? (
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid #44403C',
                  color: '#FAFAF9',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: isMobile ? '0 16px 16px' : '0 12px',
            display: isMobile ? 'flex' : 'block',
            gap: isMobile ? 12 : undefined,
            overflowX: isMobile ? 'auto' : undefined,
          }}
        >
          {(['views', 'intelligence'] as const).map((section) => (
            <div key={section} style={{ minWidth: isMobile ? 'max-content' : undefined }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#78716C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: isMobile ? '0 8px 6px' : '16px 8px 6px',
                }}
              >
                {section === 'views' ? 'Views' : 'Intelligence'}
              </div>
              {NAV_ITEMS.filter((item) => item.section === section).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 999,
                      marginBottom: 2,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#D4A853' : '#A8A29E',
                      background: isActive ? 'rgba(212, 168, 83, 0.1)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 12, width: 18, textAlign: 'center', fontWeight: 700 }}>{item.icon}</span>
                    {item.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {!isMobile ? (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #292524', fontSize: 12 }}>
            <div style={{ color: '#D6D3D1', fontWeight: 500, marginBottom: 2 }}>You / TrayLoop</div>
            <div style={{ color: '#78716C', marginBottom: 8 }}>Operator</div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#78716C',
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </aside>

      <main style={{ flex: 1, background: '#FAF9F7', overflow: 'auto' }}>
        <div style={{ padding: isMobile ? '20px 16px 28px' : '32px 40px', maxWidth: 1200 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
