'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
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
  const [revenue, setRevenue] = useState('');
  const [showResult, setShowResult] = useState(false);

  const numericRevenue = parseFloat(revenue.replace(/[^0-9.]/g, '')) || 0;
  const marketplaceLoss = numericRevenue * 0.2;
  const trayloopCost = 49;
  const monthlySavings = marketplaceLoss - trayloopCost;
  const annualSavings = monthlySavings * 12;

  const handleCalculate = () => {
    if (numericRevenue > 0) {
      setShowResult(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRevenue(val);
    if (parseFloat(val) > 0) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 28,
        border: `1px solid ${C.creamDark}`,
        maxWidth: 520,
      margin: '0 auto',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
        How much are you losing?
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: C.cream,
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
        }}
      >
        <span style={{ color: C.muted, fontSize: 14, whiteSpace: 'nowrap' }}>Monthly catering revenue</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="$5,000"
          value={revenue ? `$${Number(revenue).toLocaleString()}` : ''}
          onChange={handleChange}
          style={{
            marginLeft: 'auto',
            fontWeight: 600,
            color: C.ink,
            fontSize: 16,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            textAlign: 'right',
            width: 100,
          }}
        />
      </div>

      <div style={{ marginBottom: showResult ? 16 : 0 }}>
        <button
          onClick={handleCalculate}
          style={{
            display: 'inline-block',
            borderRadius: 999,
            fontWeight: 600,
            lineHeight: 1.4,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease, transform 0.15s ease',
            whiteSpace: 'nowrap',
            backgroundColor: C.orange,
            color: '#FEFCFA',
            border: 'none',
            padding: '12px 28px',
            fontSize: 16,
          }}
        >
          See my savings &rarr;
        </button>
      </div>

      {showResult && numericRevenue > 0 && (
        <div
          style={{
            backgroundColor: '#EAFAF3',
            borderRadius: 12,
            padding: 20,
            marginTop: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Marketplace commission (20%)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FF6243' }}>
              -{fmt(marketplaceLoss)}/mo
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.muted }}>TrayLoop (flat fee)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
              $49/mo
            </span>
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(29,122,85,0.2)',
              paddingTop: 10,
              marginTop: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1D7A55' }}>Annual savings</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1D7A55' }}>
              {annualSavings > 0 ? fmt(annualSavings) : '$0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
