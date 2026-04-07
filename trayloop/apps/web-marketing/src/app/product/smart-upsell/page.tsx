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

export default function SmartUpsellPage() {
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
            Smart Upsell
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
            Every Order Gets Bigger With the Right Suggestions
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            TrayLoop surfaces contextual add-ons at checkout based on order size, customer
            history, and headcount. Customers add with one click. Your average order value climbs.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=400&fit=crop"
          alt="Beautiful food spread with colorful dishes"
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
              More revenue per order, zero extra work
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Contextual add-on recommendations at checkout" />
              <BulletItem text="Suggestions based on order size, headcount, and history" />
              <BulletItem text="+15% average order value increase across merchants" />
              <BulletItem text="$85 average upsell revenue per order" />
              <BulletItem text="Full upsell tracking and analytics in your dashboard" />
            </ul>
          </div>

          {/* Mockup: Checkout with add-ons */}
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
                Based on order for 30 people
              </div>
              {[
                { item: 'Dessert Tray', price: '+$45', checked: true },
                { item: 'Coffee Service', price: '+$3/pp', checked: true },
                { item: 'Sparkling Water Upgrade', price: '+$28', checked: false },
                { item: 'Premium Utensil Kit', price: '+$22', checked: false },
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
                    border: u.checked
                      ? `1.5px solid ${color.teal}`
                      : `1px solid ${color.creamDark}`,
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
                  <span style={{ flex: 1, fontWeight: 500, color: color.ink, fontSize: 14 }}>
                    {u.item}
                  </span>
                  <span style={{ fontWeight: 700, color: u.checked ? color.teal : color.ink, fontSize: 14 }}>
                    {u.price}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 14,
                  padding: '12px 14px',
                  backgroundColor: '#F0FBF5',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: color.ink }}>Upsell total</span>
                <span style={{ color: color.teal }}>+$135</span>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '+15%', label: 'Average order value increase' },
            { value: '$85', label: 'Average upsell revenue per order' },
            { value: '1 click', label: 'For customers to add suggestions' },
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
            Make every order worth more.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how Smart Upsell adds revenue to every checkout without adding work.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
