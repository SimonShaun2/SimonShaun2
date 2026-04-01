'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: '◉' },
  { href: '/organizations', label: 'Restaurants', icon: '▦' },
  { href: '/users', label: 'Users', icon: '◎' },
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
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AuthenticatedShell pathname={pathname}>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { checked, authenticated } = useAdminAuth();

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#1C1917',
        color: '#FAFAF9',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#D4A853', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#1C1917',
            }}>TL</div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>TrayLoop</span>
          </div>
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 8px 6px' }}>
            Views
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#D4A853' : '#A8A29E',
                  background: isActive ? 'rgba(212, 168, 83, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #292524', fontSize: 12 }}>
          <div style={{ color: '#D6D3D1', fontWeight: 500, marginBottom: 2 }}>You / TrayLoop</div>
          <div style={{ color: '#78716C', marginBottom: 8 }}>Operator</div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', color: '#78716C',
              fontSize: 12, cursor: 'pointer', padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#FAF9F7', overflow: 'auto' }}>
        <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
