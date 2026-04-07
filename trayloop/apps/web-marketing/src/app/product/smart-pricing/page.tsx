import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

/* ── Design tokens ── */
const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

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
    <section style={{ backgroundColor: bg, padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

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

function BulletItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, listStyle: 'none' }}>
      <TealDot />
      <span style={{ color: color.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

export default function SmartPricingPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
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
            Smart Pricing
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Price Catering Based on What Actually Drives Margin
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            Build tiered packages, set per-head pricing, enforce minimums, and collect deposits
            automatically. Customers see clear options. You protect your margins on every order.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=900&h=400&fit=crop"
          alt="Catering buffet spread with variety of dishes"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── BENEFITS + MOCKUP ── */}
      <Section bg={color.white}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {/* Benefits */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 24 }}>
              Pricing that protects your margins
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Per-head, flat-rate, or hybrid pricing models" />
              <BulletItem text="Minimum order enforcement so small orders stay profitable" />
              <BulletItem text="Headcount thresholds that adjust pricing at scale" />
              <BulletItem text="Automatic deposit collection at checkout" />
              <BulletItem text="Location-specific pricing rules for multi-site operations" />
            </ul>
          </div>

          {/* Mockup: Package builder */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
                Package Builder
              </div>

              {/* Executive Lunch card */}
              <div
                style={{
                  padding: '18px 16px',
                  marginBottom: 12,
                  borderRadius: 10,
                  backgroundColor: '#FFF7F0',
                  border: `1.5px solid ${color.orange}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: color.ink, fontSize: 16 }}>
                      Executive Lunch
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: color.orange,
                        backgroundColor: '#FFF0E6',
                        padding: '2px 8px',
                        borderRadius: 999,
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      Popular
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, color: color.ink, fontSize: 20 }}>$28/head</span>
                </div>

                {/* Settings rows */}
                {[
                  { label: 'Pricing model', value: 'Per head' },
                  { label: 'Minimum headcount', value: '10 people' },
                  { label: 'Minimum order', value: '$280' },
                  { label: 'Deposit required', value: '25%' },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: `1px solid ${color.creamDark}`,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: color.muted }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: color.ink }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Other packages (collapsed) */}
              {[
                { name: 'Standard Lunch', price: '$18/head' },
                { name: 'Premium Buffet', price: '$34/head' },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: color.cream,
                    border: `1px solid ${color.creamDark}`,
                  }}
                >
                  <span style={{ fontWeight: 600, color: color.ink, fontSize: 14 }}>{pkg.name}</span>
                  <span style={{ fontWeight: 700, color: color.ink, fontSize: 14 }}>{pkg.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <Section bg={color.cream}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '+22%', label: 'Average order value with tiered pricing' },
            { value: '$0', label: 'Revenue lost to underpriced orders' },
            { value: '3 models', label: 'Per-head, flat-rate, and hybrid' },
          ].map((s) => (
            <div key={s.label} style={{ padding: 24 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: color.ink, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 15, color: color.muted, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Stop guessing. Start pricing for profit.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how Smart Pricing protects your margins on every catering order.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
