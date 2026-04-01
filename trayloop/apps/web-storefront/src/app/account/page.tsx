'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomerAccount } from '../../lib/api';
import { fetchCustomerAccount, logoutCustomer } from '../../lib/api';
import { clearCustomerSession, getCustomerToken } from '../../lib/session';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getCustomerToken()) {
        router.replace('/login?next=/account');
        return;
      }

      try {
        const result = await fetchCustomerAccount();
        if (!cancelled) {
          setAccount(result);
          setLoading(false);
        }
      } catch (err) {
        clearCustomerSession();
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load account');
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    try {
      await logoutCustomer();
    } catch {
      // Best effort logout.
    }
    clearCustomerSession();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return <Shell><Panel title="Loading account..." subtitle="Please wait while we pull your order history." /></Shell>;
  }

  if (error || !account) {
    return (
      <Shell>
        <Panel title="We couldn't load your account" subtitle={error || 'Please sign in again.'}>
          <Link href="/login" style={primaryLinkStyle}>Return to sign in</Link>
        </Panel>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: 'grid', gap: 18 }}>
        <Panel
          title={account.profile.firstName ? `${account.profile.firstName}'s Account` : 'Your Account'}
          subtitle="Saved details and order activity across TrayLoop merchants."
          action={<button type="button" onClick={handleSignOut} style={secondaryButtonStyle}>Sign Out</button>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Info label="Name" value={`${account.profile.firstName} ${account.profile.lastName}`.trim() || account.user.name} />
            <Info label="Email" value={account.profile.email} />
            <Info label="Phone" value={account.profile.phone || 'Not added yet'} />
            <Info label="Company" value={account.profile.companyName || 'Not added yet'} />
          </div>
        </Panel>

        <Panel title="Customer Profiles" subtitle="Merchants where your email is already linked to past orders.">
          <div style={{ display: 'grid', gap: 12 }}>
            {account.customerRecords.length === 0 ? (
              <Muted>No linked merchant profiles yet. Place your first order to create one automatically.</Muted>
            ) : account.customerRecords.map((record) => (
              <div key={record.id} style={recordCardStyle}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{record.organizationName}</div>
                  <div style={{ fontSize: 13, color: '#78716C', marginTop: 4 }}>
                    {record.email}{record.companyName ? ` · ${record.companyName}` : ''}
                  </div>
                </div>
                <Link href={`/${record.organizationSlug}`} style={primaryLinkStyle}>Open Storefront</Link>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Order History" subtitle="Your recent orders across connected merchants.">
          <div style={{ display: 'grid', gap: 12 }}>
            {account.orders.length === 0 ? (
              <Muted>No orders yet. Once you place one, it will show up here.</Muted>
            ) : account.orders.map((order) => (
              <div key={order.id} style={recordCardStyle}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{order.orderNumber}</span>
                    <span style={statusBadgeStyle}>{order.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#78716C' }}>
                    {order.organizationName} · {new Date(order.scheduledAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1917' }}>
                    ${(order.totalAmount / 100).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#78716C' }}>{order.headCount} guests</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAF9F7',
      padding: '40px 24px 56px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1C1917' }}>TrayLoop Customer Account</div>
            <div style={{ fontSize: 14, color: '#78716C', marginTop: 4 }}>Manage your repeat orders and account details.</div>
          </div>
          <Link href="/" style={primaryLinkStyle}>Browse Storefronts</Link>
        </div>
        {children}
      </div>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section style={{
      background: '#FFFFFF',
      border: '1px solid #E7E5E4',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 12px 40px rgba(28,25,23,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: children ? 18 : 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#1C1917' }}>{title}</h1>
          {subtitle && <p style={{ margin: '8px 0 0', color: '#78716C', fontSize: 14 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#FAFAF9',
      border: '1px solid #E7E5E4',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#A8A29E' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1917', marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, color: '#78716C', fontSize: 14 }}>{children}</p>;
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  background: '#1C1917',
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 700,
  padding: '10px 14px',
};

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#1C1917',
  borderRadius: 999,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const recordCardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  background: '#FAFAF9',
  border: '1px solid #E7E5E4',
  borderRadius: 12,
  padding: '16px 18px',
};

const statusBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  background: '#FEF3C7',
  color: '#92400E',
  padding: '4px 10px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};
