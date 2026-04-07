'use client';

import { useState } from 'react';
import PillButton from '@/components/pill-button';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

export default function SavingsCalculator() {
  const [revenue, setRevenue] = useState('5000');
  const [feePercent, setFeePercent] = useState(20);

  const numericRevenue = parseFloat(revenue.replace(/[^0-9.]/g, '')) || 0;
  const marketplaceLoss = numericRevenue * (feePercent / 100);
  const trayloopCost = 49;
  const monthlySavings = marketplaceLoss - trayloopCost;
  const annualSavings = monthlySavings * 12;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(e.target.value.replace(/[^0-9]/g, ''));
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div
      id="calculator"
      style={{
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 36,
        border: `1px solid ${C.creamDark}`,
        maxWidth: 580,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Revenue input */}
      <label style={{ fontSize: 14, fontWeight: 600, color: C.ink, display: 'block', marginBottom: 8 }}>
        Monthly catering revenue
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: C.cream,
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 20,
          border: `1px solid ${C.creamDark}`,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginRight: 4 }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="5,000"
          value={revenue ? Number(revenue).toLocaleString() : ''}
          onChange={handleChange}
          style={{
            fontWeight: 700,
            color: C.ink,
            fontSize: 24,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
          }}
        />
        <span style={{ fontSize: 14, color: C.muted, whiteSpace: 'nowrap' }}>/month</span>
      </div>

      {/* Fee slider */}
      <label style={{ fontSize: 14, fontWeight: 600, color: C.ink, display: 'block', marginBottom: 8 }}>
        Current marketplace commission
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <input
          type="range"
          min={5}
          max={30}
          value={feePercent}
          onChange={(e) => setFeePercent(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: C.orange,
            height: 6,
          }}
        />
        <span style={{ fontSize: 18, fontWeight: 700, color: C.orange, minWidth: 48, textAlign: 'right' }}>
          {feePercent}%
        </span>
      </div>

      {/* Results — always visible when revenue > 0 */}
      {numericRevenue > 0 && (
        <>
          {/* Comparison row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {/* Marketplace */}
            <div style={{
              flex: '1 1 200px',
              backgroundColor: '#FEF2F0',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid #FCDDD8',
            }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Marketplace takes</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FF6243' }}>
                -{fmt(marketplaceLoss)}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>/month at {feePercent}%</div>
            </div>

            {/* TrayLoop */}
            <div style={{
              flex: '1 1 200px',
              backgroundColor: '#EAFAF3',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid #C8F0DD',
            }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>TrayLoop costs</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1D7A55' }}>
                $49
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>/month flat — no commissions</div>
            </div>
          </div>

          {/* Annual savings */}
          <div style={{
            backgroundColor: '#EAFAF3',
            borderRadius: 14,
            padding: '20px 24px',
            textAlign: 'center',
            marginBottom: 20,
            border: '1px solid #C8F0DD',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1D7A55', marginBottom: 4 }}>
              You&apos;d save
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1D7A55', lineHeight: 1.1 }}>
              {annualSavings > 0 ? fmt(annualSavings) : '$0'}
            </div>
            <div style={{ fontSize: 14, color: '#1D7A55', marginTop: 4 }}>
              per year with TrayLoop
            </div>
            {monthlySavings > 0 && (
              <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                That&apos;s {fmt(monthlySavings)} back in your pocket every month
              </div>
            )}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <PillButton text="Sign Up and Start Saving →" href="https://dashboard.trayloophq.com/register" variant="primary" />
          </div>
        </>
      )}
    </div>
  );
}
