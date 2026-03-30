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
  completedSteps: number;
  totalSteps: number;
  steps: {
    profile: SetupStep;
    location: SetupStep;
    catalog: SetupStep;
    packages: SetupStep;
    payments: SetupStep;
  };
}

const STEP_LINKS: Record<string, { href: string; action: string }> = {
  profile: { href: '/settings', action: 'Edit Profile' },
  location: { href: '/settings/locations/new', action: 'Add Location' },
  catalog: { href: '/catalog/new', action: 'Create Catalog' },
  packages: { href: '/catalog/packages/new', action: 'Add Package' },
  payments: { href: '/settings', action: 'Connect Payments' },
};

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
  if (!status || status.isComplete) return null;

  const steps = Object.entries(status.steps) as Array<[string, SetupStep]>;
  const progressPercent = Math.round((status.completedSteps / status.totalSteps) * 100);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Get Started</h2>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          {status.completedSteps}/{status.totalSteps} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: '1.25rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progressPercent}%`, background: '#10b981', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {steps.map(([key, step]) => {
          const link = STEP_LINKS[key];
          return (
            <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem',
              opacity: step.done ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: step.done ? '#10b981' : '#e5e7eb',
                  color: step.done ? 'white' : '#6b7280',
                }}>
                  {step.done ? '✓' : ''}
                </span>
                <span style={{ fontWeight: 500, textDecoration: step.done ? 'line-through' : 'none', color: step.done ? '#9ca3af' : '#111827' }}>
                  {step.label}
                </span>
                {step.count !== undefined && step.count > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>({step.count})</span>
                )}
              </div>
              {!step.done && link && (
                <a href={link.href} style={{
                  fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none',
                  padding: '0.3rem 0.75rem', border: '1px solid #2563eb', borderRadius: '0.375rem',
                }}>
                  {link.action}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
        Complete these steps so customers can find and order from your storefront.
      </p>
    </div>
  );
}
