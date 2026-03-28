'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';

interface PaymentStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
}

type SetupState = 'loading' | 'not_started' | 'incomplete' | 'active' | 'error';

export default function SettingsPage() {
  return (
    <Suspense fallback={<p style={{ color: '#6b7280' }}>Loading settings...</p>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const stripeParam = searchParams.get('stripe');

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [setupState, setSetupState] = useState<SetupState>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchPaymentStatus();
  }, []);

  useEffect(() => {
    if (stripeParam === 'complete' || stripeParam === 'refresh') {
      syncStatus();
    }
  }, [stripeParam]);

  async function fetchPaymentStatus() {
    try {
      const res = await apiFetch('/api/organizations/current/payment-status');
      const status: PaymentStatus = res.data;
      setPaymentStatus(status);
      deriveState(status);
    } catch {
      // API call failed — show "not started" instead of error
      setPaymentStatus(null);
      setSetupState('not_started');
    }
  }

  async function syncStatus() {
    try {
      const res = await apiFetch('/api/organizations/current/payment-status/sync', { method: 'POST' });
      const status: PaymentStatus = res.data;
      setPaymentStatus(status);
      deriveState(status);
    } catch {
      fetchPaymentStatus();
    }
  }

  function deriveState(status: PaymentStatus) {
    if (status.onboardingComplete) {
      setSetupState('active');
    } else if (status.stripeAccountId && !status.detailsSubmitted) {
      setSetupState('incomplete');
    } else if (status.stripeAccountId && status.detailsSubmitted && !status.chargesEnabled) {
      setSetupState('incomplete');
    } else if (!status.stripeAccountId) {
      setSetupState('not_started');
    } else {
      setSetupState('incomplete');
    }
  }

  async function handleSetupPayments() {
    setActionLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/organizations/current/payment-onboarding-link', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: window.location.origin + '/settings' }),
      });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create onboarding link');
      setActionLoading(false);
    }
  }

  const stateConfig: Record<SetupState, { title: string; desc: string; badge: string; badgeColor: string; badgeBg: string; cta: string | null }> = {
    loading: { title: 'Payment Setup', desc: 'Loading...', badge: '', badgeColor: '', badgeBg: '', cta: null },
    not_started: {
      title: 'Payment Setup',
      desc: 'Connect your Stripe account to accept payments from customers. This is required before you can collect deposits or charge for orders.',
      badge: 'Not Started', badgeColor: '#92400E', badgeBg: '#FEF3C7',
      cta: 'Set Up Payments',
    },
    incomplete: {
      title: 'Payment Setup',
      desc: 'Your Stripe account setup is incomplete. Complete the onboarding process to start accepting payments.',
      badge: 'Incomplete', badgeColor: '#C2410C', badgeBg: '#FFF7ED',
      cta: 'Continue Stripe Onboarding',
    },
    active: {
      title: 'Payment Setup',
      desc: 'Your Stripe account is active. You can accept payments and receive payouts.',
      badge: 'Active', badgeColor: '#166534', badgeBg: '#DCFCE7',
      cta: null,
    },
    error: {
      title: 'Payment Setup',
      desc: 'Unable to load payment status.',
      badge: 'Error', badgeColor: '#991B1B', badgeBg: '#FEE2E2',
      cta: null,
    },
  };

  const config = stateConfig[setupState];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Settings</h1>

      {stripeParam === 'complete' && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ color: '#166534', fontWeight: 600, margin: 0, fontSize: 14 }}>
            Stripe onboarding updated. Checking status...
          </p>
        </div>
      )}
      {stripeParam === 'refresh' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ color: '#92400E', fontWeight: 600, margin: 0, fontSize: 14 }}>
            Stripe onboarding session expired. Click below to continue.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ color: '#DC2626', fontWeight: 500, margin: 0, fontSize: 14 }}>{error}</p>
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{config.title}</h2>
          {config.badge && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              padding: '3px 10px', borderRadius: 12,
              color: config.badgeColor, background: config.badgeBg,
            }}>
              {config.badge}
            </span>
          )}
        </div>

        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
          {config.desc}
        </p>

        {paymentStatus?.stripeAccountId && setupState !== 'loading' && (
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <span style={{ color: '#6b7280' }}>Charges: </span>
                <span style={{ fontWeight: 600, color: paymentStatus.chargesEnabled ? '#166534' : '#DC2626' }}>
                  {paymentStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Payouts: </span>
                <span style={{ fontWeight: 600, color: paymentStatus.payoutsEnabled ? '#166534' : '#DC2626' }}>
                  {paymentStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Details: </span>
                <span style={{ fontWeight: 600, color: paymentStatus.detailsSubmitted ? '#166534' : '#92400E' }}>
                  {paymentStatus.detailsSubmitted ? 'Submitted' : 'Incomplete'}
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Account: </span>
                <span style={{ fontWeight: 500, color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>
                  {paymentStatus.stripeAccountId.slice(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        )}

        {config.cta && (
          <button
            onClick={handleSetupPayments}
            disabled={actionLoading}
            style={{
              padding: '10px 24px',
              background: actionLoading ? '#9CA3AF' : '#111827',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: actionLoading ? 'wait' : 'pointer',
            }}
          >
            {actionLoading ? 'Redirecting to Stripe...' : config.cta}
          </button>
        )}

        {paymentStatus?.stripeAccountId && !paymentStatus.onboardingComplete && (
          <button
            onClick={syncStatus}
            style={{
              background: 'none', border: 'none', color: '#2563EB',
              fontSize: 13, cursor: 'pointer', marginLeft: 12,
              textDecoration: 'underline',
            }}
          >
            Refresh status
          </button>
        )}
      </div>
    </div>
  );
}
