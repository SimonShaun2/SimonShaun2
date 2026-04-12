'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PLAN_DEFINITIONS, type FeatureKey } from '@trayloop/types/src/plan-access';
import NotificationBell from './notification-bell';
import { clearMerchantSession, hasMerchantSession } from '../lib/session';
import { apiFetch, fetchStorefrontContext, type MerchantStorefrontContext } from '../lib/api';
import { automationsEnabled, growthAdvisorEnabled } from '../lib/features';
import { usePlanAccess } from './plan-access-provider';
import { useMobile } from '../lib/use-mobile';
import { getMerchantPlanDisplay } from '../lib/plan-copy';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', section: 'workspace' },
  { href: '/billing', label: 'Billing', section: 'workspace' },
  { href: '/onboarding', label: 'Launch Setup', section: 'workspace' },
  { href: '/follow-ups', label: 'Follow-Ups', section: 'workspace' },
  { href: '/automations', label: 'Automations', section: 'workspace', featureKey: 'campaigns.reactivation' as FeatureKey },
  { href: '/growth-advisor', label: 'Growth Advisor', section: 'workspace', premium: true },
  { href: '/revenue-intelligence', label: 'Revenue', section: 'workspace', featureKey: 'analytics.advanced' as FeatureKey },
  { href: '/customers', label: 'Customers', section: 'workspace', featureKey: 'customers.basic_insights' as FeatureKey },
  { href: '/catalog', label: 'Offerings', section: 'workspace' },
  { href: '/storefront/customize', label: 'Storefront', section: 'configure' },
  { href: '/settings', label: 'Settings', section: 'configure' },
];

export default function NavBar() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login'
    || pathname === '/register'
    || pathname === '/reset-password'
    || pathname === '/support-access';
  const isMobile = useMobile();
  const { billing, hasFeature, getUpgradePlan } = usePlanAccess();
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [defaultLocationName, setDefaultLocationName] = useState<string | null>(null);
  const hasGrowthAdvisorAccess = Boolean(billing?.features?.growthAdvisor?.enabled);
  const currentPlanDisplay = getMerchantPlanDisplay(billing?.currentPlan ?? null);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.href === '/automations' && !automationsEnabled) return false;
    if (item.href === '/growth-advisor' && !growthAdvisorEnabled) return false;
    return true;
  });

  useEffect(() => {
    if (isAuthPage) return;

    const signedIn = hasMerchantSession();
    const storedOrgName = localStorage.getItem('orgName');
    setSignedIn(signedIn);
    setOrgName(storedOrgName);
    setStorefrontUrl(null);
    setDefaultLocationName(null);

    if (signedIn) {
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

  function renderLockedBadge(item: (typeof NAV_ITEMS)[number]) {
    if (item.href === '/growth-advisor' && !hasGrowthAdvisorAccess) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            background: '#D4A853',
            color: '#1C1917',
            padding: '2px 7px',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
          >
          Add-on
        </span>
      );
    }

    if (!item.featureKey || hasFeature(item.featureKey)) {
      return null;
    }

    const upgradePlan = getUpgradePlan(item.featureKey);
    if (!upgradePlan) {
      return null;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          background: '#44403C',
          color: '#FAFAF9',
          padding: '2px 7px',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {PLAN_DEFINITIONS[upgradePlan].label}
      </span>
    );
  }

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
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
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
                <span>{item.label}</span>
                {renderLockedBadge(item)}
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
            <div style={{ fontSize: 11, color: '#A8A29E' }}>
              {currentPlanDisplay ? `${currentPlanDisplay.label} plan` : 'Merchant Dashboard'}
            </div>
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
              {currentPlanDisplay ? (
                <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>
                  {currentPlanDisplay.label} · {`$${(currentPlanDisplay.priceCents / 100).toFixed(0)}/mo`}
                </div>
              ) : null}
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
            {visibleNavItems.filter((item) => item.section === section).map((item) => {
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
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {renderLockedBadge(item)}
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
