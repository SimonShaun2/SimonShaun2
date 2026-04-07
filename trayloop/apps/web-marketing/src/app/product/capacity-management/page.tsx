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
  red: '#FF6243',
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

export default function CapacityManagementPage() {
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
            Capacity Management
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
            Never Overcommit Your Kitchen
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            Set lead times, operating hours, delivery zones, and headcount limits per location.
            TrayLoop automatically blocks orders when you are at capacity and opens slots when
            you are free.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&h=400&fit=crop"
          alt="Chef working in a professional kitchen"
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
              Protect your kitchen, protect your quality
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Lead time requirements ensure you have enough prep time" />
              <BulletItem text="Per-location operating hours control when orders can be placed" />
              <BulletItem text="Delivery radius and zone restrictions per location" />
              <BulletItem text="Headcount limits prevent oversized orders from slipping through" />
              <BulletItem text="Multi-location support with independent settings for each site" />
            </ul>
          </div>

          {/* Mockup: Location settings */}
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
                Location Settings — Main Kitchen
              </div>
              {[
                { label: 'Lead time required', value: '24 hours' },
                { label: 'Operating hours', value: '6:00 AM \u2013 4:00 PM' },
                { label: 'Delivery radius', value: '15 miles' },
                { label: 'Max headcount per order', value: '150 people' },
                { label: 'Max daily catering orders', value: '8' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: color.cream,
                  }}
                >
                  <span style={{ fontSize: 14, color: color.ink }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: color.ink, fontSize: 15 }}>{s.value}</span>
                </div>
              ))}

              {/* Capacity bar for the week */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: color.muted, marginBottom: 10 }}>
                  This week&apos;s capacity
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                  const fills = [5, 8, 3, 7, 2];
                  const fill = fills[i];
                  const max = 8;
                  const pct = (fill / max) * 100;
                  const atCap = fill >= max;
                  return (
                    <div
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, color: color.muted, width: 32 }}>{day}</span>
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          backgroundColor: color.creamDark,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: atCap ? color.red : color.teal,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: atCap ? color.red : color.ink,
                          width: 36,
                          textAlign: 'right',
                        }}
                      >
                        {fill}/{max}
                      </span>
                    </div>
                  );
                })}
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
            { value: '0', label: 'Overbooked days since launch' },
            { value: '24hr', label: 'Minimum lead time enforced automatically' },
            { value: '\u221e', label: 'Locations supported with independent settings' },
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
            Take control of your kitchen capacity.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how Capacity Management keeps your operation running smoothly at every location.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
