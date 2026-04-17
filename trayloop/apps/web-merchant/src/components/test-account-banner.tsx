'use client';

import { usePlanAccess } from './plan-access-provider';

export default function TestAccountBanner() {
  const { billing, loading } = usePlanAccess();

  if (loading || !billing?.isTestAccount) return null;

  return (
    <div style={{
      background: '#F59E0B',
      color: '#1C1917',
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
      letterSpacing: '0.02em',
    }}>
      Test account — Stripe payments are bypassed. No real charges will occur.
    </div>
  );
}
