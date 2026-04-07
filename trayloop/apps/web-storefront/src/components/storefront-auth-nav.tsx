'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearCustomerSession, ensureCustomerSession, hasCustomerSession } from '../lib/session';
import { fetchCurrentCustomer, logoutCustomer } from '../lib/api';

const linkStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
  opacity: 0.92,
};

export default function StorefrontAuthNav() {
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasCustomerSession()) {
        if (!cancelled) {
          setCustomerName(null);
          setLoading(false);
        }
        return;
      }

      try {
        await ensureCustomerSession();
        const session = await fetchCurrentCustomer();
        if (!session || session.role !== 'customer') {
          clearCustomerSession();
          if (!cancelled) {
            setCustomerName(null);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setCustomerName(session.name ?? session.email);
          setLoading(false);
        }
      } catch {
        clearCustomerSession();
        if (!cancelled) {
          setCustomerName(null);
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleSignOut() {
    try {
      await logoutCustomer();
    } catch {
      // Best effort; local session still gets cleared.
    }
    clearCustomerSession();
    setCustomerName(null);
    router.push(pathname ?? '/');
    router.refresh();
  }

  if (loading) {
    return (
      <div style={{ color: '#D6D3D1', fontSize: 12, fontWeight: 500 }}>
        Loading account...
      </div>
    );
  }

  if (!customerName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Link href="/login" style={linkStyle}>Sign In</Link>
        <Link href="/signup" style={linkStyle}>Create Account</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <Link href="/account" style={linkStyle}>Account</Link>
      <span style={{ color: '#D6D3D1', fontSize: 12, whiteSpace: 'nowrap' }}>{customerName}</span>
      <button
        type="button"
        onClick={handleSignOut}
        style={{
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'transparent',
          color: '#FFFFFF',
          borderRadius: 999,
          padding: '6px 10px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
