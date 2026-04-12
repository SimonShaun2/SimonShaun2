'use client';

import { useEffect, useState } from 'react';
import { apiFetch, type MerchantOnboardingStatus } from '../lib/api';
import { useLaunchReview } from '../lib/use-launch-review';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  last7DaysOrders: number;
  last7DaysRevenue: number;
}

export default function LaunchApprovalCard({
  launchStatus,
  compact = false,
}: {
  launchStatus: MerchantOnboardingStatus;
  compact?: boolean;
}) {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { state, approved, setStorefrontReviewed, setReadyToShare } = useLaunchReview(launchStatus.organization.id);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await apiFetch('/api/orders/stats');
        if (!cancelled) {
          setStats(response.data as OrderStats);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasOrders = (stats?.totalOrders ?? 0) > 0;
  const readinessItems = [
    {
      label: 'Billing',
      state: launchStatus.billing.state === 'active' ? 'Ready' : 'Needs attention',
      tone: launchStatus.billing.state === 'active' ? '#166534' : '#9A3412',
    },
    {
      label: 'Payouts',
      state: launchStatus.paymentStatus.status === 'ready' ? 'Ready' : 'Needs attention',
      tone: launchStatus.paymentStatus.status === 'ready' ? '#166534' : '#9A3412',
    },
    {
      label: 'Offerings',
      state: (launchStatus.setup.steps.offering.count ?? 0) > 0 ? 'Ready' : 'Needs attention',
      tone: (launchStatus.setup.steps.offering.count ?? 0) > 0 ? '#166534' : '#9A3412',
    },
    {
      label: 'Test order',
      state: hasOrders ? 'Observed' : 'Recommended',
      tone: hasOrders ? '#166534' : '#9A3412',
    },
  ];
  const verificationSequence = hasOrders
    ? [
        'Verify the latest order details and customer fields look clean.',
        'Confirm the storefront is ready to share publicly.',
        'Hand the merchant a live ordering link with confidence.',
      ]
    : [
        'Open the live storefront and place one final test order.',
        'Check menu pricing, checkout details, and confirmation flow.',
        'Mark the storefront reviewed and ready to share.',
      ];

  return (
    <section
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: compact ? 16 : 18,
        background: '#FFFFFF',
        padding: compact ? 16 : 18,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', marginBottom: 10 }}>
        Launch approval
      </div>

      <div style={{ fontSize: compact ? 18 : 20, fontWeight: 800, color: '#1C1917', lineHeight: 1.08 }}>
        {approved ? 'Approved for live sharing' : 'Run the final launch review'}
      </div>

      <p style={{ margin: '8px 0 0', color: '#57534E', fontSize: 13, lineHeight: 1.7 }}>
        {hasOrders
          ? 'Order activity is already showing up for this workspace. Confirm the storefront flow and mark it ready to share.'
          : 'Before sharing broadly, place a final test order from the live storefront and confirm the pricing, checkout flow, and customer details.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: 10, marginTop: 14 }}>
        {readinessItems.map((item) => (
          <div key={item.label} style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FCFBF8', padding: '12px 13px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C' }}>
              {item.label}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: item.tone }}>{item.state}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 14,
          background: hasOrders ? '#F0FDF4' : '#FFF7ED',
          border: `1px solid ${hasOrders ? '#BBF7D0' : '#FCD34D'}`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: hasOrders ? '#166534' : '#9A3412', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {hasOrders ? 'Order signal detected' : 'Test order recommended'}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: hasOrders ? '#166534' : '#7C2D12', lineHeight: 1.6 }}>
          {loading
            ? 'Checking storefront order activity...'
            : hasOrders
              ? `${stats?.totalOrders ?? 0} order${(stats?.totalOrders ?? 0) === 1 ? '' : 's'} detected in this workspace.${stats?.last7DaysRevenue ? ` ${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.last7DaysRevenue / 100)} landed in the last 7 days.` : ''}`
              : 'No orders detected yet for this storefront.'}
        </div>
      </div>

      <div style={{ marginTop: 14, borderRadius: 14, background: '#FAFAF9', border: '1px solid #E7E5E4', padding: '14px 15px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', marginBottom: 8 }}>
          Verification sequence
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {verificationSequence.map((item, index) => (
            <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: '#1C1917', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={state.storefrontReviewed}
            onChange={(event) => setStorefrontReviewed(event.target.checked)}
          />
          <span>I reviewed the storefront and verified pricing, menu, and location details.</span>
        </label>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={state.readyToShare}
            onChange={(event) => setReadyToShare(event.target.checked)}
          />
          <span>I'm comfortable sharing this storefront publicly now.</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {launchStatus.launch.liveStorefrontUrl ? (
          <a href={launchStatus.launch.liveStorefrontUrl} target="_blank" rel="noopener noreferrer" style={primaryLinkStyle}>
            Test storefront
          </a>
        ) : null}
        <a href="/launch" style={secondaryLinkStyle}>Open launch center</a>
      </div>
    </section>
  );
}

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid #E7E5E4',
  background: '#FCFBF8',
  fontSize: 13,
  color: '#57534E',
  lineHeight: 1.6,
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  borderRadius: 12,
  background: '#1C1917',
  color: '#FFFFFF',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  borderRadius: 12,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#57534E',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
};
