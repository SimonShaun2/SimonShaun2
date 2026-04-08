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

/* ── Auto-cycling screens for phone mockup ── */
const phoneScreens = [
  {
    type: 'storefront',
    title: "Downtown Kitchen",
    loc: 'Austin, TX · Catering',
    packages: [
      { name: 'Taco Platter', price: '$10/pp' },
      { name: 'Lunch Box', price: '$14.95/pp' },
      { name: 'Premium Buffet', price: '$29.95/pp' },
    ],
  },
  {
    type: 'checkout',
    title: 'Order Summary',
    items: [
      { label: 'Premium Buffet × 30', value: '$898.50' },
      { label: 'Coffee Service', value: '+$90.00' },
      { label: 'Total', value: '$988.50' },
    ],
    deposit: '$247.13',
  },
  {
    type: 'success',
    title: 'Order Confirmed',
    detail: 'Deposit received · $247.13',
    next: 'Delivery: Thursday 11:30 AM',
  },
];

export default function AnimatedHero() {
  const [screen, setScreen] = useState(0);
  const [activityPulse, setActivityPulse] = useState(0);

  useEffect(() => {
    const screenTimer = setInterval(() => setScreen((s) => (s + 1) % phoneScreens.length), 3200);
    const pulseTimer = setInterval(() => setActivityPulse((p) => (p + 1) % 3), 2400);
    return () => {
      clearInterval(screenTimer);
      clearInterval(pulseTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 1100,
        margin: '0 auto',
        paddingBottom: 40,
      }}
    >
      <style>{`
        @keyframes tlFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tlPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes tlSlideIn {
          0% { opacity: 0; transform: translateX(16px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes tlCountUp {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .tl-screen { animation: tlFadeIn 0.5s ease-out; }
        .tl-pulse { animation: tlPulse 2s ease-in-out infinite; }
        .tl-activity { animation: tlSlideIn 0.5s ease-out; }
        @media (max-width: 900px) {
          .tl-hero-browser {
            padding-right: 0 !important;
          }
          .tl-hero-phone {
            position: relative !important;
            right: auto !important;
            bottom: auto !important;
            margin: 20px auto 0 !important;
            width: 230px !important;
          }
        }
        @media (max-width: 768px) {
          .tl-hero-browser {
            border-radius: 12px !important;
          }
          .tl-hero-dash-area {
            min-height: 280px !important;
          }
          .tl-hero-sidebar {
            width: 120px !important;
          }
          .tl-hero-sidebar-logo {
            font-size: 13px !important;
            padding: 0 12px 14px !important;
          }
          .tl-hero-sidebar-item {
            font-size: 11px !important;
            padding: 6px 12px !important;
          }
          .tl-hero-dash-main {
            padding: 16px !important;
          }
          .tl-hero-dash-title {
            font-size: 15px !important;
          }
          .tl-hero-kpi-value {
            font-size: 16px !important;
          }
          .tl-hero-kpi-label {
            font-size: 10px !important;
          }
          .tl-hero-phone {
            width: 200px !important;
            margin-top: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .tl-hero-sidebar {
            width: 88px !important;
          }
          .tl-hero-sidebar-logo {
            font-size: 11px !important;
            padding: 0 10px 12px !important;
          }
          .tl-hero-sidebar-item {
            font-size: 10px !important;
            padding: 5px 10px !important;
          }
          .tl-hero-dash-main {
            padding: 12px !important;
          }
          .tl-hero-phone {
            width: 180px !important;
          }
        }
      `}</style>

      {/* Browser frame — Dashboard */}
      <div
        className="tl-hero-browser"
        style={{
          backgroundColor: C.white,
          borderRadius: 16,
          border: `1px solid ${C.creamDark}`,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          paddingRight: 240,
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            backgroundColor: C.creamDark,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#E85618', opacity: 0.6 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F5C542', opacity: 0.6 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#42D9A0', opacity: 0.6 }} />
          <div
            style={{
              flex: 1,
              marginLeft: 12,
              backgroundColor: C.white,
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              color: C.muted,
            }}
          >
            dashboard.trayloophq.com
          </div>
        </div>

        <div className="tl-hero-dash-area" style={{ display: 'flex', minHeight: 360 }}>
          {/* Sidebar */}
          <div
            className="tl-hero-sidebar"
            style={{
              width: 180,
              backgroundColor: C.ink,
              padding: '20px 0',
              flexShrink: 0,
            }}
          >
            <div className="tl-hero-sidebar-logo" style={{ padding: '0 16px 20px', fontSize: 16, fontWeight: 700, color: C.white }}>
              Tray.Loop
            </div>
            {['Dashboard', 'Orders', 'Customers', 'Offerings', 'Follow-Ups', 'Revenue'].map(
              (item, i) => (
                <div
                  key={item}
                  className="tl-hero-sidebar-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: i === 0 ? C.orange : '#9A8E84',
                    backgroundColor: i === 0 ? 'rgba(232,86,24,0.1)' : 'transparent',
                    borderLeft: i === 0 ? `3px solid ${C.orange}` : '3px solid transparent',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: i === 0 ? C.orange : '#5A5350',
                    }}
                  />
                  {item}
                </div>
              ),
            )}
          </div>

          {/* Main */}
          <div className="tl-hero-dash-main" style={{ flex: 1, padding: 24, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div className="tl-hero-dash-title" style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>Dashboard</div>
                <div style={{ fontSize: 12, color: C.muted }}>Downtown Kitchen · Austin, TX</div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#E8FAF1',
                  color: '#1A8A5A',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                <span
                  className="tl-pulse"
                  style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.teal }}
                />
                Live
              </div>
            </div>

            {/* KPIs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'Revenue', value: '$18,400', color: C.ink },
                { label: 'Recurring', value: '$12,800', color: C.teal },
                { label: 'Reorder Rate', value: '72%', color: C.ink },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  style={{
                    backgroundColor: C.cream,
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <div className="tl-hero-kpi-label" style={{ fontSize: 11, color: C.muted }}>{kpi.label}</div>
                  <div
                    key={`${kpi.value}-${activityPulse}`}
                    className="tl-activity tl-hero-kpi-value"
                    style={{ fontSize: 20, fontWeight: 700, color: kpi.color, marginTop: 2 }}
                  >
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Activity feed — cycling */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: '0.05em' }}>
              LIVE ACTIVITY
            </div>
            {[
              { text: 'Reorder triggered — Apex Financial', time: 'Just now', color: C.orange },
              { text: 'Deposit collected — $247.13', time: '2 min ago', color: C.teal },
              { text: 'New order — TechCorp HQ', time: '8 min ago', color: C.teal },
            ].map((a, i) => (
              <div
                key={`${a.text}-${activityPulse}`}
                className={i === activityPulse ? 'tl-activity' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: `1px solid ${C.creamDark}`,
                }}
              >
                <span
                  className={i === activityPulse ? 'tl-pulse' : ''}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: a.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{a.text}</span>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phone frame — Auto-cycling storefront */}
      <div
        className="tl-hero-phone"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 250,
          borderRadius: 28,
          border: `3px solid ${C.ink}`,
          backgroundColor: C.ink,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Notch */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', backgroundColor: C.ink }}>
          <div style={{ width: 80, height: 5, borderRadius: 10, backgroundColor: '#333' }} />
        </div>

        {/* Screen content — cycles */}
        <div
          key={`screen-${screen}`}
          className="tl-screen"
          style={{
            backgroundColor: C.cream,
            minHeight: 420,
            padding: '14px 14px 16px',
          }}
        >
          {phoneScreens[screen].type === 'storefront' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
                {phoneScreens[screen].title}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>
                {phoneScreens[screen].loc}
              </div>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 600, marginBottom: 12 }}>
                ● Accepting Orders
              </div>
              <div
                style={{
                  height: 70,
                  borderRadius: 8,
                  backgroundColor: '#C9A878',
                  marginBottom: 12,
                  backgroundImage:
                    'linear-gradient(135deg, #C9A878 0%, #B08B5E 100%)',
                }}
              />
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: '0.05em' }}>
                PACKAGES
              </div>
              {phoneScreens[screen].packages?.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: `1px solid ${C.creamDark}`,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.orange }}>{p.price}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 12,
                  backgroundColor: C.orange,
                  color: C.white,
                  textAlign: 'center',
                  padding: '10px 0',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Order Catering →
              </div>
            </>
          )}

          {phoneScreens[screen].type === 'checkout' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 16 }}>
                {phoneScreens[screen].title}
              </div>
              {phoneScreens[screen].items?.map((item, i, arr) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.creamDark}`,
                    borderTop: i === arr.length - 1 ? `1px solid ${C.creamDark}` : 'none',
                    marginTop: i === arr.length - 1 ? 6 : 0,
                    paddingTop: i === arr.length - 1 ? 12 : 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: i === arr.length - 1 ? C.ink : C.muted,
                      fontWeight: i === arr.length - 1 ? 700 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: i === arr.length - 1 ? C.ink : C.ink,
                      fontWeight: 700,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 14,
                  backgroundColor: C.cream,
                  border: `1px solid ${C.creamDark}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 11,
                }}
              >
                <div style={{ color: C.muted }}>Deposit (25%)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.orange, marginTop: 2 }}>
                  {phoneScreens[screen].deposit}
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  backgroundColor: C.orange,
                  color: C.white,
                  textAlign: 'center',
                  padding: '10px 0',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Pay Deposit →
              </div>
              <div style={{ textAlign: 'center', fontSize: 9, color: C.muted, marginTop: 8 }}>
                🔒 Secure checkout · Stripe
              </div>
            </>
          )}

          {phoneScreens[screen].type === 'success' && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div
                className="tl-pulse"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: C.teal,
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  color: C.white,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                {phoneScreens[screen].title}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
                {phoneScreens[screen].detail}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.ink,
                  backgroundColor: C.white,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${C.creamDark}`,
                }}
              >
                {phoneScreens[screen].next}
              </div>
            </div>
          )}
        </div>

        {/* Home bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', backgroundColor: C.ink }}>
          <div style={{ width: 60, height: 4, borderRadius: 10, backgroundColor: '#444' }} />
        </div>
      </div>
    </div>
  );
}
