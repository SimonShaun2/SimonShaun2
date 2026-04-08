'use client';

import { useEffect, useState } from 'react';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

const activities = [
  { text: 'New order — TechCorp', amount: '+$1,240', color: '#42D9A0' },
  { text: 'Reorder triggered — Apex', amount: 'auto', color: '#E85618' },
  { text: 'Deposit collected', amount: '+$247', color: '#42D9A0' },
];

export default function MobileDashboardCard() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % activities.length), 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 320,
        margin: '0 auto',
        padding: '8px 0 16px',
      }}
    >
      <style>{`
        @keyframes mhFadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes mhPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .mh-new { animation: mhFadeUp 0.5s ease-out; }
        .mh-pulse { animation: mhPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Decorative teal gradient bg — like Owner.com */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,217,160,0.15) 0%, rgba(66,217,160,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* Floating product card */}
      <div
        style={{
          position: 'relative',
          backgroundColor: C.white,
          borderRadius: 20,
          border: `1px solid ${C.creamDark}`,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em' }}>
              YOUR DASHBOARD WHEN YOU&apos;RE LIVE
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>
              Downtown Kitchen
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: '#E8FAF1',
              color: '#1A8A5A',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
            }}
          >
            <span
              className="mh-pulse"
              style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.teal }}
            />
            LIVE
          </div>
        </div>

        {/* Hero stat — big and bold */}
        <div
          style={{
            backgroundColor: C.ink,
            borderRadius: 14,
            padding: '18px 18px 16px',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9A8E84', letterSpacing: '0.06em' }}>
            RECURRING REVENUE
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: C.white,
              marginTop: 2,
              letterSpacing: '-0.02em',
            }}
          >
            $18,400
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              color: C.teal,
              marginTop: 2,
            }}
          >
            <span>↑ 23%</span>
            <span style={{ color: '#9A8E84', fontWeight: 400 }}>this month</span>
          </div>
        </div>

        {/* Secondary KPI row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div
            style={{
              flex: 1,
              backgroundColor: C.cream,
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.04em' }}>
              RECURRING
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.teal, marginTop: 2 }}>
              $12.8K
            </div>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: C.cream,
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.04em' }}>
              REORDER RATE
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginTop: 2 }}>72%</div>
          </div>
        </div>

        {/* Live activity */}
        <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', marginBottom: 8 }}>
          LIVE ACTIVITY
        </div>
        <div
          key={idx}
          className="mh-new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: C.cream,
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 6,
          }}
        >
          <span
            className="mh-pulse"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: activities[idx].color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: C.ink, flex: 1, fontWeight: 500 }}>
            {activities[idx].text}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: activities[idx].color }}>
            {activities[idx].amount}
          </span>
        </div>

        {/* Zero commissions badge */}
        <div
          style={{
            marginTop: 12,
            backgroundColor: '#FEF6F1',
            border: `1px solid ${C.creamDark}`,
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.04em' }}>
              COMMISSION FEES
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.orange, marginTop: 1 }}>$0</div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'right', maxWidth: 120, lineHeight: 1.3 }}>
            kept from<br />marketplaces
          </div>
        </div>
      </div>
    </div>
  );
}
