import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';
import SavingsCalculator from '@/components/savings-calculator';

/* ── Design tokens ── */
const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

/* ── Reusable section wrapper ── */
function Section({
  children,
  bg = 'transparent',
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        backgroundColor: bg,
        padding: '80px 24px',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

/* ── Small helpers ── */
function TealDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color.teal,
        marginRight: 10,
        flexShrink: 0,
        marginTop: 7,
      }}
    />
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, listStyle: 'none' }}>
      <TealDot />
      <span style={{ color: color.ink, fontSize: 16, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

function XItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14, listStyle: 'none' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#FDEAEA',
          color: color.red,
          fontSize: 13,
          fontWeight: 700,
          marginRight: 10,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ✕
      </span>
      <span style={{ color: color.ink, fontSize: 16, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

/* ── Stat card for credibility bar ── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: color.ink }}>{value}</div>
      <div style={{ fontSize: 14, color: color.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 300px',
        backgroundColor: color.white,
        borderRadius: 16,
        padding: 32,
        border: `1px solid ${color.creamDark}`,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: color.orange,
          marginBottom: 12,
        }}
      >
        {number}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: color.ink, marginBottom: 12 }}>{title}</h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: color.muted }}>{description}</p>
    </div>
  );
}

/* ── Outcome card (dark) ── */
function OutcomeCard({
  title,
  aiNote,
  stat,
}: {
  title: string;
  aiNote: string;
  stat: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 300px',
        backgroundColor: '#2A2520',
        borderRadius: 16,
        padding: 32,
      }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 700, color: color.white, marginBottom: 16, lineHeight: 1.4 }}>
        {title}
      </h3>
      <div
        style={{
          fontSize: 13,
          color: color.teal,
          marginBottom: 12,
        }}
      >
        Assisted by AI: <span style={{ color: '#C2B9AE' }}>{aiNote}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color.white }}>{stat}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main>
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 72, paddingBottom: 64 }}>
        <style>{`
          @keyframes tl-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes tl-feed {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes tl-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
          .tl-hero-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 48px;
            align-items: center;
          }
          .tl-hero-text { text-align: left; }
          .tl-hero-phone-wrap { display: flex; justify-content: center; }
          @media (max-width: 860px) {
            .tl-hero-grid {
              grid-template-columns: 1fr;
              gap: 32px;
            }
            .tl-hero-text { text-align: center; }
            .tl-hero-ctas { justify-content: center !important; }
            .tl-hero-h1 { font-size: 40px !important; }
          }
        `}</style>

        <div className="tl-hero-grid">
          {/* LEFT — text */}
          <div className="tl-hero-text">
            <h1
              className="tl-hero-h1"
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.08,
                marginBottom: 20,
                letterSpacing: '-0.02em',
              }}
            >
              Keep every dollar on your catering orders.
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.5,
                color: color.muted,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              Direct ordering you own. No commissions. $49/month.
            </p>
            <div
              className="tl-hero-ctas"
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <PillButton text="Book a free demo →" href="/demo" variant="primary" />
              <PillButton text="See how it works" href="/how-it-works" variant="ghost" />
            </div>
          </div>

          {/* RIGHT — animated phone mockup */}
          <div className="tl-hero-phone-wrap">
            <div
              style={{
                width: '100%',
                maxWidth: 320,
                animation: 'tl-float 6s ease-in-out infinite',
                backgroundColor: color.ink,
                borderRadius: 36,
                padding: 6,
                boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
              }}
            >
              <div
                style={{
                  backgroundColor: color.white,
                  borderRadius: 30,
                  overflow: 'hidden',
                }}
              >
                {/* Notch */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '10px 0 6px',
                    backgroundColor: color.white,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 5,
                      borderRadius: 10,
                      backgroundColor: color.ink,
                    }}
                  />
                </div>

                {/* App header */}
                <div
                  style={{
                    padding: '14px 18px 10px',
                    borderBottom: `1px solid ${color.creamDark}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: color.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Monthly revenue
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 26, fontWeight: 800, color: color.ink }}>
                      $10,240
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: color.teal,
                      }}
                    >
                      ↑ 23%
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#1A8A5A',
                      backgroundColor: '#E8FAF1',
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: color.teal,
                        animation: 'tl-pulse 1.6s ease-in-out infinite',
                      }}
                    />
                    Live
                  </div>
                </div>

                {/* Scrolling feed */}
                <div
                  style={{
                    padding: '12px 18px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: color.muted,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Activity
                </div>
                <div
                  style={{
                    height: 260,
                    overflow: 'hidden',
                    position: 'relative',
                    padding: '0 14px 14px',
                  }}
                >
                  <div style={{ animation: 'tl-feed 18s linear infinite' }}>
                    {[
                      ...[
                        { icon: '🟢', t: 'New order — $1,240', s: 'TechCorp HQ' },
                        { icon: '✉️', t: 'Reorder reminder sent', s: 'Apex Financial' },
                        { icon: '💰', t: 'Upsell added +$85', s: 'Beverage package' },
                        { icon: '🟢', t: 'New order — $680', s: 'Metro Law Group' },
                        { icon: '🔒', t: 'Deposit secured', s: '$400 · Friday event' },
                        { icon: '🟢', t: 'New order — $2,100', s: 'StartupCo' },
                        { icon: '⚡', t: 'Follow-up generated', s: 'Greenleaf Co.' },
                        { icon: '🟢', t: 'New order — $960', s: 'Downtown Kitchen' },
                      ],
                      ...[
                        { icon: '🟢', t: 'New order — $1,240', s: 'TechCorp HQ' },
                        { icon: '✉️', t: 'Reorder reminder sent', s: 'Apex Financial' },
                        { icon: '💰', t: 'Upsell added +$85', s: 'Beverage package' },
                        { icon: '🟢', t: 'New order — $680', s: 'Metro Law Group' },
                        { icon: '🔒', t: 'Deposit secured', s: '$400 · Friday event' },
                        { icon: '🟢', t: 'New order — $2,100', s: 'StartupCo' },
                        { icon: '⚡', t: 'Follow-up generated', s: 'Greenleaf Co.' },
                        { icon: '🟢', t: 'New order — $960', s: 'Downtown Kitchen' },
                      ],
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 6px',
                          borderBottom: `1px solid ${color.creamDark}`,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{row.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: color.ink,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.t}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: color.muted,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.s}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* top + bottom fades */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 24,
                      background: `linear-gradient(${color.white}, rgba(255,255,255,0))`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 32,
                      background: `linear-gradient(rgba(255,255,255,0), ${color.white})`,
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Home indicator */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '6px 0 10px',
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 4,
                      borderRadius: 10,
                      backgroundColor: color.ink,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SAVINGS CALCULATOR ── */}
      <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink }}>See what you&apos;re losing.</h2>
        </div>
        <SavingsCalculator />
      </Section>

      {/* ── IMAGE STRIP — ICP ── */}
      <Section bg={color.cream} style={{ padding: '0 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink }}>Built for any kitchen that does catering</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop', alt: 'Restaurant chef preparing catering orders', caption: 'Restaurants' },
            { src: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400&h=300&fit=crop', alt: 'Food truck owner serving customers', caption: 'Food Trucks' },
            { src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=300&fit=crop', alt: 'Catering company team setting up event', caption: 'Catering Companies' },
            { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', alt: 'Cloud kitchen worker packaging orders', caption: 'Cloud Kitchens' },
          ].map((img) => (
            <div key={img.src} style={{ flexShrink: 0 }}>
              <img
                src={img.src}
                alt={img.alt}
                style={{ width: 260, height: 195, objectFit: 'cover', borderRadius: 12, display: 'block' }}
              />
              <div style={{ fontSize: 12, color: color.muted, marginTop: 8, textAlign: 'center' }}>{img.caption}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CREDIBILITY BAR ── */}
      <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <StatCard value="$2.4M+" label="Catering revenue processed" />
          <StatCard value="72%" label="Average reorder rate" />
          <StatCard value="3×" label="More repeat orders vs. marketplace" />
          <StatCard value="$1,840/mo" label="Average revenue recovered" />
        </div>
        {/* Trust compression */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            borderTop: `1px solid rgba(0,0,0,0.06)`,
            paddingTop: 24,
          }}
        >
          {[
            'Live in days',
            'We handle setup',
            'POS-agnostic',
            'Keep your marketplaces',
          ].map((label) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(66, 217, 160, 0.15)',
                  color: color.teal,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: color.ink }}>{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── URGENCY SECTION ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: color.ink,
              marginBottom: 12,
            }}
          >
            Restaurants switching from marketplace to direct
          </h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          {[
            { name: "Maria's Cocina", activity: 'Saved $2,100/mo in commissions', time: '3 days ago' },
            { name: 'Greenleaf Catering Co.', activity: 'First automated reorder — $890, zero effort', time: '1 week ago' },
            { name: 'Brooklyn Bites', activity: '12 accounts migrated in 48 hrs', time: '2 weeks ago' },
          ].map((r) => (
            <div
              key={r.name}
              style={{
                flex: '1 1 300px',
                maxWidth: 340,
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontWeight: 700, color: color.ink, fontSize: 16, marginBottom: 8 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5, marginBottom: 8 }}>
                {r.activity}
              </div>
              <div style={{ fontSize: 12, color: color.muted }}>{r.time}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── MID CTA ── */}
      <Section bg={color.cream} style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="See What You're Losing →" href="#calculator" variant="primary" />
          <PillButton text="See the System →" href="/product" variant="ghost" />
        </div>
      </Section>

      {/* ── PROBLEM SECTION ── */}
      <Section bg={color.white}>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: color.ink,
            lineHeight: 1.2,
            textAlign: 'center',
            marginBottom: 40,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Marketplaces don&apos;t grow your business. They tax it.
        </h2>

        <img
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1100&h=400&fit=crop"
          alt="Busy restaurant kitchen during service"
          style={{ width: '100%', borderRadius: 16, marginBottom: 40, display: 'block', objectFit: 'cover', maxHeight: 400 }}
        />

        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Pain points */}
          <div style={{ flex: '1 1 460px' }}>
            <ul style={{ padding: 0 }}>
              <XItem text="They take 15–30% of every order for sitting in the middle." />
              <XItem text="They own your customers. You just get a name on a ticket." />
              <XItem text="No follow-up. No repeat system. Revenue resets every Monday." />
              <XItem text="You're too busy to chase reorders manually." />
              <XItem text="Every month you wait is more commissions paid." />
            </ul>
          </div>

          {/* Revenue Bleed card */}
          <div style={{ flex: '1 1 400px' }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 32,
                color: color.white,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: color.red,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                Monthly Revenue Bleed
              </div>
              {[
                { label: 'Marketplace commissions (30%)', value: '$3,600' },
                { label: 'Lost reorders (no follow-up)', value: '$640' },
                { label: 'Missed upsell opportunities', value: '$320' },
                { label: 'Manual process inefficiency', value: '$280' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: '#C2B9AE' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: color.red }}>{item.value}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                <span>Total lost per month</span>
                <span style={{ color: color.red }}>$4,840</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SYSTEM SECTION ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.orange,
              textTransform: 'uppercase' as const,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            The System
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: color.ink, lineHeight: 1.2, maxWidth: 760, margin: '0 auto 16px' }}>
            A system that captures, converts, and compounds.
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <StepCard
            number="01"
            title="Capture"
            description="A branded ordering page replaces marketplace listings. Orders come directly to you. Zero commissions."
          />
          <StepCard
            number="02"
            title="Convert"
            description="Confirmation, reminders, and deposits run on autopilot. Your kitchen gets clean orders. You touch nothing."
          />
          <StepCard
            number="03"
            title="Repeat"
            description="The system reaches out before customers go quiet. Revenue compounds instead of resetting."
          />
        </div>
      </Section>

      {/* ── SEE THE STOREFRONT IN ACTION ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Left — Phone mockup */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 280,
                borderRadius: 36,
                border: `4px solid ${color.ink}`,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                backgroundColor: color.ink,
              }}
            >
              {/* Phone notch */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', backgroundColor: color.ink }}>
                <div style={{ width: 80, height: 5, borderRadius: 10, backgroundColor: '#333' }} />
              </div>
              {/* Storefront image */}
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=500&fit=crop"
                alt="Food spread representing your branded storefront"
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
              />
              {/* Phone bottom bar */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', backgroundColor: color.ink }}>
                <div style={{ width: 60, height: 4, borderRadius: 10, backgroundColor: '#444' }} />
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.orange, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 12 }}>
              Branded Storefront
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 16 }}>
              Your customers order directly from you
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: color.muted, marginBottom: 24 }}>
              A storefront you own. No middleman, no commissions. You keep the customer and the revenue.
            </p>
            <ul style={{ padding: 0, marginBottom: 24 }}>
              <CheckItem text="Branded URL — your name, your identity" />
              <CheckItem text="No marketplace listing or commission fees" />
              <CheckItem text="Deposits collected automatically at checkout" />
              <CheckItem text="Customers bookmark and reorder in seconds" />
            </ul>
            <a
              href="https://order.trayloophq.com/downtown-kitchen"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: color.orange,
                color: color.white,
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              See a live storefront example →
            </a>
          </div>
        </div>
      </Section>

      {/* ── REVENUE ENGINE SECTION ── */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.orange,
              textTransform: 'uppercase' as const,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            How You Grow
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.white,
              lineHeight: 1.2,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Turn one order into a recurring account. Then do it again.
          </h2>
        </div>

        {/* 3 outcome cards */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 48 }}>
          <OutcomeCard
            title="Customers come back on their own"
            aiNote="Predicts the best time to send a reorder reminder."
            stat="72% reorder rate"
          />
          <OutcomeCard
            title="Spot accounts before they churn"
            aiNote="Flags accounts showing signs of churn."
            stat="3× fewer lost accounts"
          />
          <OutcomeCard
            title="Follow up without writing a word"
            aiNote="Generates personalized follow-ups from order history."
            stat="14 hrs/week saved"
          />
        </div>

        {/* Full-width upsell card */}
        <div
          style={{
            backgroundColor: '#2A2520',
            borderRadius: 16,
            padding: 40,
            marginBottom: 48,
          }}
        >
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 16,
                  lineHeight: 1.3,
                }}
              >
                Every order is an upsell opportunity
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#C2B9AE', marginBottom: 20 }}>
                Smart checkout adds beverages, desserts, and upgrades automatically.
              </p>
              <div style={{ fontSize: 13, color: color.teal }}>
                Assisted by AI:{' '}
                <span style={{ color: '#C2B9AE' }}>
                  Recommends the highest-converting add-ons based on order size and customer
                  history.
                </span>
              </div>
            </div>
            <div style={{ flex: '1 1 340px' }}>
              {/* Upsell mockup */}
              <div
                style={{
                  backgroundColor: color.ink,
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ fontSize: 13, color: color.muted, marginBottom: 12 }}>
                  Checkout — Suggested add-ons
                </div>
                {[
                  { item: 'Beverage Package', price: '+$85', pct: '+12%' },
                  { item: 'Dessert Platter', price: '+$65', pct: '+9%' },
                  { item: 'Premium Utensil Kit', price: '+$25', pct: '+4%' },
                ].map((u) => (
                  <div
                    key={u.item}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: color.white }}>{u.item}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: color.teal, fontWeight: 600 }}>{u.price}</span>
                      <span style={{ color: color.muted, fontSize: 12 }}>{u.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div
          style={{
            backgroundColor: '#2A2520',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: color.muted, marginBottom: 20 }}>
            Dashboard Preview
          </div>
          {/* KPIs row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              { label: 'Monthly Revenue', value: '$18,400', change: '+23%' },
              { label: 'Active Accounts', value: '34', change: '+8' },
              { label: 'Reorder Rate', value: '72%', change: '+12%' },
              { label: 'Avg Order Value', value: '$542', change: '+$38' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  backgroundColor: color.ink,
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 12, color: color.muted }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: color.white, marginTop: 4 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: color.teal, marginTop: 4 }}>{kpi.change}</div>
              </div>
            ))}
          </div>

          {/* Accounts table */}
          <div style={{ fontSize: 13, fontWeight: 600, color: color.muted, marginBottom: 12 }}>
            Top Accounts
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Account', 'Last Order', 'Total Revenue', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        color: color.muted,
                        fontSize: 12,
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Apex Financial',
                    date: 'Apr 2',
                    revenue: '$12,800',
                    status: 'Active',
                    statusColor: color.teal,
                  },
                  {
                    name: 'TechCorp HQ',
                    date: 'Mar 29',
                    revenue: '$9,420',
                    status: 'Active',
                    statusColor: color.teal,
                  },
                  {
                    name: 'Metro Law Group',
                    date: 'Mar 15',
                    revenue: '$6,200',
                    status: 'At risk',
                    statusColor: color.orange,
                  },
                ].map((row) => (
                  <tr key={row.name}>
                    <td style={{ padding: '10px 12px', color: color.white }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', color: '#C2B9AE' }}>{row.date}</td>
                    <td style={{ padding: '10px 12px', color: color.white, fontWeight: 600 }}>
                      {row.revenue}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          color: row.statusColor,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: row.statusColor,
                          }}
                        />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── BEFORE / AFTER ── */}
      <Section bg={color.cream}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Before &amp; After TrayLoop
        </h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Before */}
          <div
            style={{
              flex: '1 1 460px',
              backgroundColor: color.white,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: color.red,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              Before
            </div>
            <ul style={{ padding: 0 }}>
              {[
                '15–30% of every order goes to the marketplace',
                "No idea which accounts are about to stop ordering",
                'Follow-up only happens when you remember',
                'Revenue resets to zero every Monday',
                'No system. Just hustle.',
              ].map((t) => (
                <XItem key={t} text={t} />
              ))}
            </ul>
          </div>

          {/* After */}
          <div
            style={{
              flex: '1 1 460px',
              backgroundColor: color.white,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: color.teal,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              After
            </div>
            <ul style={{ padding: 0 }}>
              {[
                'Zero commissions — every dollar stays with you',
                'At-risk accounts flagged before they disappear',
                'Reorder outreach runs on autopilot',
                'Revenue compounds month over month',
                'A system that runs while you run service',
              ].map((t) => (
                <CheckItem key={t} text={t} />
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIAL ── */}
      <Section bg={color.white}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: color.creamDark, lineHeight: 1, marginBottom: 16 }}>
            &ldquo;
          </div>
          <blockquote
            style={{
              fontSize: 22,
              lineHeight: 1.6,
              color: color.ink,
              fontStyle: 'italic',
              marginBottom: 24,
            }}
          >
            We were paying $3,200 a month in commissions and had no idea who our customers were. TrayLoop gave us our accounts back. 72% now reorder on their own.
          </blockquote>
          <div style={{ fontWeight: 700, color: color.ink }}>Maria S.</div>
          <div style={{ fontSize: 14, color: color.muted }}>
            Owner, Rosario&apos;s Kitchen
          </div>
        </div>
      </Section>

      {/* ── WHO IT'S FOR ── */}
      <Section bg={color.cream}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Who It&apos;s For
        </h2>
        <p
          style={{
            fontSize: 16,
            color: color.muted,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          For restaurants at every stage of catering growth.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            {
              title: 'The Marketplace Hostage',
              description:
                "You're doing $10K+/month in catering — but 30% goes to someone else. Own your customers. Keep your revenue.",
              img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop',
              alt: 'Office workers eating catered lunch',
            },
            {
              title: 'The Inconsistent Operator',
              description:
                "Some weeks are great, others are dead. You need automation for follow-ups — not another task.",
              img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
              alt: 'Restaurant kitchen during busy service',
            },
            {
              title: 'The Growth-Ready Team',
              description:
                "You have a solid catering program. Now you need the infrastructure to scale it.",
              img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
              alt: 'Team meeting planning catering growth strategy',
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                flex: '1 1 300px',
                backgroundColor: color.white,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <img
                src={card.img}
                alt={card.alt}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: 32 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: color.ink,
                    marginBottom: 14,
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: color.muted }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer pre-CTA handles the closing CTA */}
    </main>
  );
}
