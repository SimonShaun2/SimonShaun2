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

export default function MerchantPortalPage() {
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
            Merchant Self-Service Portal
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
            Run Your Entire Catering Operation From One Dashboard
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            Manage orders, customers, menus, locations, and revenue from a single screen.
            No support tickets. No back-and-forth emails. Everything you need, self-serve.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop"
          alt="Dashboard and analytics"
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
              Everything in one place
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Full order management with status tracking and history" />
              <BulletItem text="Customer database with health scores and lifetime value" />
              <BulletItem text="Drag-and-drop menu builder with categories and modifiers" />
              <BulletItem text="Location settings for hours, zones, and capacity" />
              <BulletItem text="Revenue reporting with trends and breakdowns" />
              <BulletItem text="Self-serve everything — no support tickets needed" />
            </ul>
          </div>

          {/* Mockup: Dashboard sidebar */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 0,
                border: `1px solid ${color.creamDark}`,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  width: 180,
                  backgroundColor: color.ink,
                  padding: '24px 0',
                  flexShrink: 0,
                }}
              >
                <div style={{ padding: '0 16px 20px', fontSize: 14, fontWeight: 700, color: color.white }}>
                  TrayLoop
                </div>
                {[
                  { name: 'Dashboard', active: true },
                  { name: 'Orders', active: false },
                  { name: 'Customers', active: false },
                  { name: 'Menu Builder', active: false },
                  { name: 'Locations', active: false },
                  { name: 'Revenue', active: false },
                  { name: 'Settings', active: false },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: item.active ? 600 : 400,
                      color: item.active ? color.white : color.muted,
                      backgroundColor: item.active ? 'rgba(66,217,160,0.15)' : 'transparent',
                      borderLeft: item.active ? `3px solid ${color.teal}` : '3px solid transparent',
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div style={{ flex: 1, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 16 }}>
                  Dashboard
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  {[
                    { label: 'This Month', value: '$8,420' },
                    { label: 'Pending', value: '3' },
                    { label: 'Accounts', value: '18' },
                    { label: 'Reorder Rate', value: '72%' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        backgroundColor: color.cream,
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ fontSize: 10, color: color.muted }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: color.ink, marginTop: 2 }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '0', label: 'Support tickets needed to manage your portal' },
            { value: '48hrs', label: 'From signup to live portal' },
            { value: '100%', label: 'Self-serve — you control everything' },
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
            Your catering dashboard, ready in 48 hours.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how the merchant portal puts you in full control of your operation.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
