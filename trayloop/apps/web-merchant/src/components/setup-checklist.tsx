'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface SetupStep {
  done: boolean;
  label: string;
  count?: number;
}

interface SetupStatus {
  isComplete: boolean;
  slug: string;
  completedSteps: number;
  totalSteps: number;
  steps: {
    offering: SetupStep;
    location: SetupStep;
    payments: SetupStep;
  };
}

const STEPS: Array<{
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}> = [
  {
    key: 'offering',
    title: 'Add your first offering',
    description: 'Create a catering package so customers can start ordering from your storefront.',
    cta: 'Add Package',
    href: '/catalog',
  },
  {
    key: 'location',
    title: 'Set your order requirements',
    description: 'Configure your location details, lead time, minimum order, and delivery settings.',
    cta: 'Edit Location',
    href: '/settings',
  },
  {
    key: 'payments',
    title: 'Connect payments',
    description: 'Link your Stripe account to accept deposits and get paid. Takes about 2–3 minutes. Securely powered by Stripe.',
    cta: 'Set Up Stripe',
    href: '/settings',
  },
];

export default function SetupChecklist() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/organizations/current/setup-status')
      .then((res) => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!status) return null;

  // "You're Live" completion state
  if (status.isComplete) {
    const storefrontUrl = `${window.location.origin.replace(':3003', ':3002')}/${status.slug}`;
    return (
      <div style={{
        border: '2px solid #22C55E', borderRadius: 12, padding: '28px 24px',
        marginBottom: 24, background: '#F0FDF4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🎉</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#166534', margin: 0 }}>You're live!</h2>
            <p style={{ fontSize: 14, color: '#15803D', margin: '2px 0 0' }}>Your storefront is ready to accept orders.</p>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: 8,
          padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#374151',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{storefrontUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(storefrontUrl)}
            style={{
              background: 'none', border: '1px solid #D6D3D1', borderRadius: 6,
              padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#57534E',
            }}
          >
            Copy
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: '10px 20px', background: '#1C1917', color: '#FFF',
            borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🔗 View Your Storefront
          </a>
          <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: '10px 20px', background: '#FFF', color: '#1C1917',
            border: '1px solid #E7E5E4', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: 600,
          }}>
            Place a Test Order
          </a>
        </div>

        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 12, marginBottom: 0 }}>
          Test your ordering experience before sharing with customers.
        </p>
      </div>
    );
  }

  // Guided onboarding — show one active step at a time
  const stepEntries = STEPS.map((s) => ({
    ...s,
    done: (status.steps as Record<string, SetupStep>)[s.key]?.done ?? false,
  }));

  const activeStepIndex = stepEntries.findIndex((s) => !s.done);
  const progressPercent = Math.round((status.completedSteps / status.totalSteps) * 100);

  return (
    <div style={{
      border: '1px solid #E7E5E4', borderRadius: 12, padding: '24px',
      marginBottom: 24, background: '#FFFFFF',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0 }}>Get ready to accept orders</h2>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
          {status.completedSteps} of {status.totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#E7E5E4', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progressPercent}%`, background: '#22C55E', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stepEntries.map((step, i) => {
          const isActive = i === activeStepIndex;
          const isDone = step.done;

          return (
            <div key={step.key} style={{
              border: `1px solid ${isActive ? '#1C1917' : '#E7E5E4'}`,
              borderRadius: 10,
              padding: isActive ? '16px 18px' : '12px 18px',
              background: isDone ? '#FAFAF9' : isActive ? '#FFFFFF' : '#FAFAF9',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Step indicator */}
                <div style={{
                  width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: isDone ? '#22C55E' : isActive ? '#1C1917' : '#E7E5E4',
                  color: isDone || isActive ? '#FFF' : '#9CA3AF',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>

                {/* Step content */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 600,
                    color: isDone ? '#9CA3AF' : '#1C1917',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {step.title}
                  </span>
                  {isActive && (
                    <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {step.description}
                    </p>
                  )}
                </div>

                {/* CTA */}
                {isActive && (
                  <a href={step.href} style={{
                    padding: '8px 18px', background: '#1C1917', color: '#FFF',
                    borderRadius: 8, textDecoration: 'none', fontSize: 13,
                    fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {step.cta}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
