import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';
export const alt = 'TrayLoop — Stop paying 20-30% on every catering order';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand tokens (match the homepage design)
const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  green: '#1D7A55',
  greenLight: '#A8E6CE',
  redBg: '#FEF2F0',
  redBorder: '#FCDDD8',
  tealBg: '#EAFAF3',
};

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: C.cream,
          fontFamily: '"Inter", system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* ═══ Top bar: logo + AI badge ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '56px 72px 0 72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: '-0.02em',
              }}
            >
              Tray
            </span>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: C.orange,
                marginLeft: 2,
                marginRight: 2,
                marginBottom: 6,
              }}
            />
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: '-0.02em',
              }}
            >
              Loop
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: C.ink,
              color: C.white,
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ color: C.orange, marginRight: 8 }}>✦</span>
            AI-POWERED CATERING
          </div>
        </div>

        {/* ═══ Main content row ═══ */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '48px 72px 0 72px',
          }}
        >
          {/* LEFT COLUMN */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 640,
              paddingRight: 32,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: C.orange,
                letterSpacing: '0.12em',
                marginBottom: 18,
              }}
            >
              CATERING REVENUE THAT STAYS WITH YOU
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: 22,
              }}
            >
              Stop paying 20–30% on every catering order.
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: C.muted,
                lineHeight: 1.45,
                marginBottom: 32,
                maxWidth: 580,
              }}
            >
              Replace marketplace commissions with a direct ordering system you own.
            </div>

            {/* CTA pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: C.orange,
                color: C.white,
                borderRadius: 999,
                padding: '18px 32px',
                fontSize: 22,
                fontWeight: 800,
                alignSelf: 'flex-start',
              }}
            >
              trayloophq.com
              <span style={{ marginLeft: 10 }}>→</span>
            </div>
          </div>

          {/* RIGHT COLUMN — Preview card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 420,
              backgroundColor: C.white,
              borderRadius: 20,
              padding: 22,
              border: `1px solid ${C.creamDark}`,
              boxShadow: '0 20px 48px rgba(26,22,18,0.15)',
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: C.ink,
                  color: C.white,
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <span style={{ color: C.orange, marginRight: 5 }}>✦</span>
                AI MODE
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: C.teal,
                    marginRight: 6,
                  }}
                />
                GPT-4o
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 800,
                color: C.ink,
                marginBottom: 10,
              }}
            >
              Your AI analysis
            </div>

            {/* Recap pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: C.cream,
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: C.muted,
                marginBottom: 12,
              }}
            >
              💬 BBQ restaurant · Austin · $12k/mo · EzCater
            </div>

            {/* AI insight card (dark) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: C.ink,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.orange,
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                ✦ AI ANALYSIS
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 13,
                  color: C.white,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                BBQ catering in Austin runs 15–20% fees on EzCater — closer to $1,800/mo lost.
              </div>
            </div>

            {/* Comparison cards */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: C.redBg,
                  border: `1px solid ${C.redBorder}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 9,
                    fontWeight: 800,
                    color: C.muted,
                    letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}
                >
                  WITH EZCATER
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.ink,
                  }}
                >
                  $10,200
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 10,
                    color: C.muted,
                    marginTop: 2,
                  }}
                >
                  you keep / mo
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: C.tealBg,
                  border: `2px solid ${C.teal}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 9,
                    fontWeight: 800,
                    color: C.green,
                    letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}
                >
                  WITH TRAYLOOP
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.green,
                  }}
                >
                  $11,951
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 10,
                    color: C.muted,
                    marginTop: 2,
                  }}
                >
                  you keep / mo
                </div>
              </div>
            </div>

            {/* Punchline */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: C.green,
                borderRadius: 12,
                padding: '14px 18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.greenLight,
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                YOU&apos;D KEEP
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.white,
                  lineHeight: 1.1,
                }}
              >
                $1,751 more every month
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 12,
                  color: C.greenLight,
                  marginTop: 4,
                }}
              >
                $21,012 per year
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Bottom meta strip ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 72px 40px 72px',
            marginTop: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['$49/month flat', 'No commissions', 'No contracts'].map((t, i) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: i < 2 ? 20 : 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: C.teal,
                    marginRight: 8,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{t}</span>
                {i < 2 && (
                  <span style={{ color: C.muted, marginLeft: 20, fontSize: 14 }}>·</span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            trayloophq.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
