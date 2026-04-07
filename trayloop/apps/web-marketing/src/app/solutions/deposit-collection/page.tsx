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

export default function DepositCollectionPage() {
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
            Collect Deposits Automatically on Every Order
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, marginBottom: 32 }}>
            No-shows and last-minute cancellations cost caterers thousands every year. TrayLoop
            collects deposits at checkout via Stripe so you&apos;re protected before you start prepping.
            Professional, automatic, and friction-free.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800&h=400&fit=crop"
          alt="Secure payment checkout"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── TWO COLUMN: BENEFITS + VISUAL ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 20 }}>
              Get paid upfront. Deliver with confidence.
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Automatic deposit collection at checkout — no awkward conversations" />
              <BulletItem text="Configurable deposit percentage (25%, 50%, or custom)" />
              <BulletItem text="Powered by Stripe for secure, PCI-compliant payments" />
              <BulletItem text="Reduces no-shows by 85% on average" />
              <BulletItem text="Improves cash flow — money in your account before you prep" />
              <BulletItem text="Professional checkout experience that builds trust" />
            </ul>
          </div>

          {/* ── DEPOSIT CHECKOUT MOCKUP ── */}
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
                Checkout — Deposit Required
              </div>

              {/* Order summary */}
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Premium Lunch (30 people)', value: '$780.00' },
                  { label: 'Beverage Package', value: '$120.00' },
                  { label: 'Delivery Fee', value: '$25.00' },
                ].map((line) => (
                  <div
                    key={line.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      fontSize: 14,
                      color: color.ink,
                      borderBottom: `1px solid ${color.creamDark}`,
                    }}
                  >
                    <span>{line.label}</span>
                    <span style={{ fontWeight: 600 }}>{line.value}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    fontSize: 16,
                    fontWeight: 700,
                    color: color.ink,
                  }}
                >
                  <span>Order Total</span>
                  <span>$925.00</span>
                </div>
              </div>

              {/* Deposit section */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#F0FBF5',
                  borderRadius: 10,
                  border: `1.5px solid ${color.teal}`,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: color.teal }}>DEPOSIT DUE NOW (50%)</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: color.teal }}>$462.50</div>
                </div>
                <div style={{ fontSize: 12, color: color.muted }}>
                  Remaining $462.50 due on delivery day
                </div>
              </div>

              {/* Stripe mockup */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: color.cream,
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 12, color: color.muted, marginBottom: 8 }}>Card number</div>
                <div style={{ fontSize: 14, color: color.ink, fontFamily: 'monospace' }}>
                  **** **** **** 4242
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  backgroundColor: color.teal,
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.white,
                }}
              >
                Pay $462.50 Deposit
              </div>

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: color.muted }}>
                Secured by Stripe. PCI-compliant.
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <Section bg={color.cream}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          {[
            { value: '85%', label: 'Reduction in no-shows' },
            { value: '2 days', label: 'Faster cash flow on average' },
            { value: '$0', label: 'Lost to last-minute cancellations' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                backgroundColor: color.white,
                borderRadius: 14,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: color.teal, marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: color.muted }}>{stat.label}</div>
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
            Protect your revenue before you start prepping.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Automatic deposits that eliminate no-shows and improve your cash flow.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>
    </>
  );
}
