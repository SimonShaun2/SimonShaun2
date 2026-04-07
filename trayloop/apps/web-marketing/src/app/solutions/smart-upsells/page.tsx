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

export default function SmartUpsellsPage() {
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
            Increase Every Order With Contextual Suggestions
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, marginBottom: 32 }}>
            The easiest revenue you&apos;ll ever make. TrayLoop suggests relevant add-ons at checkout
            based on order size, past preferences, and time of day. Customers add with one click.
            Average order value goes up 15%.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&h=400&fit=crop"
          alt="Beautifully presented food dishes"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── TWO COLUMN: BENEFITS + CHECKOUT MOCKUP ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 20 }}>
              Smarter checkout. Bigger orders.
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Contextual suggestions based on order size, contents, and history" />
              <BulletItem text="One-click add-ons — no phone calls or manual quoting" />
              <BulletItem text="Beverage packages, dessert platters, premium upgrades" />
              <BulletItem text="Track acceptance rates and revenue impact per upsell item" />
              <BulletItem text="Configure which items appear and set display rules" />
              <BulletItem text="Works seamlessly within the checkout flow" />
            </ul>
          </div>

          {/* ── CHECKOUT MOCKUP ── */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 4 }}>
                Checkout — Suggested Add-ons
              </div>
              <div style={{ fontSize: 12, color: color.muted, marginBottom: 16 }}>
                Order for 30 people - Premium Lunch Package
              </div>

              {/* Order subtotal */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: color.cream,
                  borderRadius: 10,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                }}
              >
                <span style={{ color: color.muted }}>Subtotal (30 x $26)</span>
                <span style={{ fontWeight: 700, color: color.ink }}>$780.00</span>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: color.orange, marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                Recommended Add-ons
              </div>

              {[
                { item: 'Beverage Package', price: '+$120', rate: '68% add', checked: true },
                { item: 'Dessert Platter', price: '+$85', rate: '54% add', checked: true },
                { item: 'Premium Utensil Kit', price: '+$35', rate: '42% add', checked: false },
                { item: 'Sparkling Water Upgrade', price: '+$45', rate: '31% add', checked: false },
              ].map((u) => (
                <div
                  key={u.item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    marginBottom: 6,
                    borderRadius: 10,
                    backgroundColor: u.checked ? '#F0FBF5' : color.cream,
                    border: u.checked ? `1.5px solid ${color.teal}` : `1px solid ${color.creamDark}`,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: u.checked ? color.teal : 'transparent',
                      border: u.checked ? 'none' : `1.5px solid ${color.muted}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color.white,
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {u.checked ? '\u2713' : ''}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500, color: color.ink, fontSize: 14 }}>{u.item}</span>
                  <span style={{ fontSize: 12, color: color.muted }}>{u.rate}</span>
                  <span style={{ fontWeight: 700, color: color.teal, fontSize: 14 }}>{u.price}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 14,
                  padding: '14px',
                  backgroundColor: '#F0FBF5',
                  borderRadius: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                  <span style={{ color: color.muted }}>Upsell total</span>
                  <span style={{ fontWeight: 700, color: color.teal }}>+$205</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                  <span style={{ color: color.ink }}>New total</span>
                  <span style={{ color: color.ink }}>$985.00</span>
                </div>
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
            { value: '+15%', label: 'Average order value increase' },
            { value: '58%', label: 'Customers add at least one upsell' },
            { value: '$420', label: 'Extra revenue per month (avg)' },
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
            Make more from every order.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Smart upsells that increase revenue without increasing effort.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>
    </>
  );
}
