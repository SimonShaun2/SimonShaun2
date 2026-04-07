import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

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

export default function DirectOrderingPage() {
  return (
    <>
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
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
            Grow Revenue
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
            Stop Paying Commissions. Start Ordering Direct.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, marginBottom: 32 }}>
            Every order through a marketplace costs you 15-30% in commissions. TrayLoop gives you a
            branded storefront on your own URL so customers order directly from you. Your brand, your
            customers, your data — and you keep the revenue.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=400&fit=crop"
          alt="Fresh food platter with vibrant ingredients"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── TWO COLUMN: BENEFITS + VISUAL ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 20 }}>
              Your storefront. Your rules.
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Branded ordering page with your logo, colors, and menu" />
              <BulletItem text="Your own URL — customers see your brand, not a marketplace" />
              <BulletItem text="You own the customer data: emails, order history, preferences" />
              <BulletItem text="No per-order commissions — flat $49/month pricing" />
              <BulletItem text="Customers reorder in two clicks from past orders" />
              <BulletItem text="Mobile-optimized checkout for on-the-go office managers" />
            </ul>
          </div>

          {/* ── COMPARISON VISUAL ── */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.cream,
                borderRadius: 16,
                padding: 28,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 20 }}>
                Cost Comparison: $5,000/mo in catering orders
              </div>

              {/* Marketplace row */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  backgroundColor: color.white,
                  border: `1px solid ${color.creamDark}`,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: color.ink }}>Marketplace</div>
                    <div style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>20% commission per order</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#D32F2F' }}>-$1,000</div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    height: 6,
                    backgroundColor: color.creamDark,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#D32F2F', borderRadius: 3 }} />
                </div>
              </div>

              {/* TrayLoop row */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  backgroundColor: '#F0FBF5',
                  border: `1.5px solid ${color.teal}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: color.ink }}>TrayLoop</div>
                    <div style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>$49/mo flat + 5% platform fee</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: color.teal }}>-$299</div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    height: 6,
                    backgroundColor: color.creamDark,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '30%', height: '100%', backgroundColor: color.teal, borderRadius: 3 }} />
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: color.teal,
                }}
              >
                You save $701/month with TrayLoop
              </div>
            </div>
          </div>
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
            Ready to stop paying commissions?
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Your branded storefront is live within 48 hours. No contracts, cancel anytime.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>
    </>
  );
}
