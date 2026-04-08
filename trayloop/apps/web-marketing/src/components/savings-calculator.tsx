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

  const vol = parseFloat(revenue.replace(/[^0-9.]/g, '')) || 0;
  const theyTake = Math.round(vol * (feePercent / 100));
  const youKeepMarketplace = vol - theyTake;
  const youKeepTrayloop = vol - 49;
  const extraPerMonth = youKeepTrayloop - youKeepMarketplace;
  const extraPerYear = extraPerMonth * 12;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div
      id="calculator"
      style={{
        backgroundColor: C.white,
        borderRadius: 20,
        padding: '40px 36px',
        border: `1px solid ${C.creamDark}`,
        maxWidth: 600,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}
    >
      <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4, textAlign: 'center' }}>
        What are marketplaces costing you?
      </h3>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, textAlign: 'center' }}>
        Enter your numbers. See what you keep.
      </p>

      {/* Revenue input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: 'block', marginBottom: 8 }}>
          Your monthly catering revenue
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: C.cream,
            borderRadius: 12,
            padding: '16px 20px',
            border: `2px solid ${C.creamDark}`,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: C.ink, marginRight: 2 }}>$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="5,000"
            value={revenue ? Number(revenue).toLocaleString() : ''}
            onChange={(e) => setRevenue(e.target.value.replace(/[^0-9]/g, ''))}
            style={{
              fontWeight: 700,
              color: C.ink,
              fontSize: 28,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Fee slider */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
            Marketplace commission rate
          </label>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.orange }}>{feePercent}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={30}
          value={feePercent}
          onChange={(e) => setFeePercent(Number(e.target.value))}
          style={{ width: '100%', accentColor: C.orange, height: 6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 4 }}>
          <span>10%</span>
          <span>30%</span>
        </div>
      </div>

      {vol > 0 && (
        <>
          {/* Side-by-side: Marketplace vs TrayLoop */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {/* With marketplace */}
            <div style={{
              flex: '1 1 220px',
              borderRadius: 14,
              padding: '20px',
              backgroundColor: '#FEF2F0',
              border: '1px solid #FCDDD8',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                With marketplace
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Revenue</span>
                <span style={{ fontSize: 13, color: C.ink }}>{fmt(vol)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Commission ({feePercent}%)</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FF6243' }}>-{fmt(theyTake)}</span>
              </div>
              <div style={{ borderTop: '1px solid #F5CCC5', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>You keep</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{fmt(youKeepMarketplace)}</span>
              </div>
            </div>

            {/* With TrayLoop */}
            <div style={{
              flex: '1 1 220px',
              borderRadius: 14,
              padding: '20px',
              backgroundColor: '#EAFAF3',
              border: '2px solid #42D9A0',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                With TrayLoop
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Revenue</span>
                <span style={{ fontSize: 13, color: C.ink }}>{fmt(vol)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: C.muted }}>TrayLoop</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1D7A55' }}>-$49</span>
              </div>
              <div style={{ borderTop: '1px solid #B8E8D4', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1D7A55' }}>You keep</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1D7A55' }}>{fmt(youKeepTrayloop)}</span>
              </div>
            </div>
          </div>

          {/* The punchline — how much more you keep */}
          {extraPerMonth > 0 && (
            <div style={{
              backgroundColor: '#1D7A55',
              borderRadius: 16,
              padding: '24px 28px',
              textAlign: 'center',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#A8E6CE', marginBottom: 6 }}>
                You keep
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                {fmt(extraPerMonth)} more
              </div>
              <div style={{ fontSize: 16, color: '#A8E6CE', marginTop: 4 }}>
                every month — {fmt(extraPerYear)} per year
              </div>
              <div style={{ fontSize: 13, color: '#A8E6CE', marginTop: 10, opacity: 0.8 }}>
                That&apos;s not a projection. That&apos;s what you paid last month.<br />
                And you&apos;ll pay it again next month if nothing changes.
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <PillButton text="Start Keeping Your Revenue →" href="https://dashboard.trayloophq.com/register" variant="primary" />
          </div>
        </>
      )}
    </div>
  );
}
