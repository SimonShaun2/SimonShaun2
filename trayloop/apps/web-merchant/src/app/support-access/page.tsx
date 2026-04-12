'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupportSession } from '../../lib/api';
import { markMerchantSession } from '../../lib/session';

const SAFE_TARGETS = new Set(['/', '/catalog', '/launch', '/onboarding', '/settings', '/customers', '/orders']);
const ADMIN_APP_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://master.trayloophq.com';

function sanitizeTarget(target: string | null) {
  if (!target || !target.startsWith('/')) {
  return '/launch';
  }

  const [pathname] = target.split('?');
  if (!pathname || !SAFE_TARGETS.has(pathname)) {
    return '/launch';
  }

  return target;
}

function SupportAccessBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Preparing merchant workspace...');

  const orgId = searchParams.get('orgId');
  const fallbackOrgSlug = searchParams.get('orgSlug');
  const fallbackOrgName = searchParams.get('orgName');
  const target = useMemo(() => sanitizeTarget(searchParams.get('target')), [searchParams]);
  const targetLabel =
    target === '/catalog'
      ? 'Menu Editor'
      : target === '/settings'
        ? 'Settings'
        : target === '/customers'
          ? 'Customers'
          : target === '/orders'
            ? 'Orders'
            : 'Launch Center';

  useEffect(() => {
    if (!orgId) {
      setError('Missing merchant workspace details. Reopen this link from the master dashboard.');
      return;
    }

    const resolvedOrgId = orgId;
    let cancelled = false;

    async function bootstrapSupportAccess() {
      try {
        setStatus('Opening merchant workspace...');
        const session = await createSupportSession(resolvedOrgId);
        if (cancelled) return;

        const organization = session.organization;
        markMerchantSession();
        localStorage.setItem('orgId', organization.id);
        localStorage.setItem('orgSlug', organization.slug || fallbackOrgSlug || '');
        localStorage.setItem('orgName', organization.name || fallbackOrgName || 'Merchant Workspace');

        router.replace(target);
      } catch (bootstrapError) {
        if (cancelled) return;
        setError(bootstrapError instanceof Error ? bootstrapError.message : 'Unable to open this merchant workspace.');
      }
    }

    bootstrapSupportAccess();

    return () => {
      cancelled = true;
    };
  }, [fallbackOrgName, fallbackOrgSlug, orgId, router, target]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F6F2',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 18,
          border: '1px solid #E7E5E4',
          background: '#FFFFFF',
          boxShadow: '0 24px 50px rgba(28, 25, 23, 0.08)',
          padding: 28,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#D4A853', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Support Access
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: '12px 0 8px', color: '#1C1917' }}>
          Opening merchant workspace
        </h1>
        <p style={{ margin: 0, color: '#57534E', fontSize: 14, lineHeight: 1.6 }}>
          TrayLoop is creating a scoped support session so your onboarding team can update this merchant&apos;s setup,
          menu, and storefront without changing permanent account ownership.
        </p>

        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FCFBF8', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C' }}>
              Merchant
            </div>
            <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800, color: '#1C1917' }}>{fallbackOrgName || 'Merchant workspace'}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#78716C' }}>
              {fallbackOrgSlug ? `${fallbackOrgSlug} · ` : ''}Targeting {targetLabel}
            </div>
          </div>
          <div style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.6 }}>
              We keep this handoff scoped so support can move quickly without taking over the merchant&apos;s permanent account ownership or login flow.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            borderRadius: 12,
            background: error ? '#FEF2F2' : '#F5F5F4',
            color: error ? '#B91C1C' : '#44403C',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {error || status}
        </div>

        {!error ? (
          <p style={{ marginTop: 16, fontSize: 13, color: '#78716C' }}>
            If this takes longer than a few seconds, head back to the master dashboard and retry the merchant access link.
          </p>
        ) : (
          <div style={{ marginTop: 18 }}>
            <a
              href={`${ADMIN_APP_URL}/organizations`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: 10,
                background: '#1C1917',
                color: '#FAFAF9',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to master dashboard
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

function SupportAccessFallback() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F6F2',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 18,
          border: '1px solid #E7E5E4',
          background: '#FFFFFF',
          boxShadow: '0 24px 50px rgba(28, 25, 23, 0.08)',
          padding: 28,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#D4A853', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Support Access
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: '12px 0 8px', color: '#1C1917' }}>
          Preparing merchant workspace
        </h1>
        <p style={{ margin: 0, color: '#57534E', fontSize: 14, lineHeight: 1.6 }}>
          Loading the merchant support handoff.
        </p>
      </div>
    </main>
  );
}

export default function SupportAccessPage() {
  return (
    <Suspense fallback={<SupportAccessFallback />}>
      <SupportAccessBody />
    </Suspense>
  );
}
