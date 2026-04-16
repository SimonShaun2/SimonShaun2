'use client';

import { useEffect } from 'react';

export default function MerchantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== 'undefined') {
      console.error('Merchant dashboard error:', error);
    }
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '60px auto',
        padding: 24,
        border: '1px solid #E7E5E4',
        borderRadius: 14,
        background: '#FFFFFF',
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
        Something went wrong loading this page.
      </h1>
      <p style={{ fontSize: 14, color: '#57534E', lineHeight: 1.6, margin: '0 0 16px' }}>
        Your session is still active. Try reloading this view or heading back to the dashboard.
      </p>
      {error?.message ? (
        <p style={{ fontSize: 12, color: '#78716C', fontFamily: 'monospace', margin: '0 0 16px' }}>
          {error.message}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: '#1C1917',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: '#FFFFFF',
            color: '#57534E',
            border: '1px solid #D6D3D1',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
