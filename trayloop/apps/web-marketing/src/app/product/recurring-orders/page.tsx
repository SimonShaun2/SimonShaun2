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

export default function RecurringOrdersPage() {
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
            Recurring Order Automation
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
            Turn One-Time Orders Into Recurring Revenue
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            TrayLoop detects reorder patterns in your catering accounts and automatically
            reaches out at the perfect moment. Customers reorder in two clicks. You never
            chase a follow-up again.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=400&fit=crop"
          alt="Restaurant service with elegant plating"
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
              How it works
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="AI detects reorder patterns from every account's order history" />
              <BulletItem text="Automated outreach reaches customers at exactly the right time" />
              <BulletItem text="Dormant account recovery re-engages customers who stopped ordering" />
              <BulletItem text="Revenue compounds without any manual effort from your team" />
            </ul>
          </div>

          {/* Mockup: Reorder timeline */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: color.muted, marginBottom: 16 }}>
                Reorder Timeline — Apex Financial
              </div>
              {[
                { date: 'Mar 7', event: 'Order placed — $1,240', dot: color.teal },
                { date: 'Mar 12', event: 'Pattern detected (bi-weekly)', dot: color.orange },
                { date: 'Mar 19', event: 'Outreach sent', dot: color.orange },
                { date: 'Mar 21', event: 'Reorder placed — $1,240', dot: color.teal },
                { date: 'Apr 2', event: 'Outreach sent', dot: color.orange },
                { date: 'Apr 3', event: 'Reorder placed — $1,380 (+upsell)', dot: color.teal },
              ].map((item) => (
                <div
                  key={item.date + item.event}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: 12, color: color.muted, width: 52, flexShrink: 0 }}>
                    {item.date}
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: item.dot,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 14, color: color.white }}>{item.event}</span>
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
            { value: '$1,840/mo', label: 'Average revenue recovered per merchant' },
            { value: '3\u00d7', label: 'Increase in repeat orders' },
            { value: '72%', label: 'Reorder rate from automated outreach' },
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
            Stop losing repeat revenue to silence.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Let TrayLoop follow up with every account, every time, at exactly the right moment.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
