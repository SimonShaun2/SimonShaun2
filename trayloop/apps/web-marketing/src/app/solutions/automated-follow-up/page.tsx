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

export default function AutomatedFollowUpPage() {
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
            Never Lose a Catering Customer to Silence Again
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, marginBottom: 32 }}>
            Most catering customers churn because no one follows up. TrayLoop automates every
            touchpoint — from order confirmation to post-delivery check-in — so your customers feel
            taken care of and keep coming back.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=400&fit=crop"
          alt="Restaurant owner greeting customers"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── TWO COLUMN: BENEFITS + TIMELINE ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 20 }}>
              Every touchpoint, handled automatically.
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Instant order confirmations with delivery details" />
              <BulletItem text="Pre-order reminders 24 hours before delivery" />
              <BulletItem text="Post-delivery follow-up to check satisfaction" />
              <BulletItem text="Reorder nudges based on each account's ordering cadence" />
              <BulletItem text="Customizable templates that match your brand voice" />
              <BulletItem text="No manual emails — everything runs on autopilot" />
            </ul>
          </div>

          {/* ── TIMELINE MOCKUP ── */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: color.muted, marginBottom: 20 }}>
                Automated Sequence — Apex Financial
              </div>
              {[
                {
                  time: 'T+0 min',
                  event: 'Order confirmed — email + SMS sent',
                  dot: color.teal,
                  detail: 'Hi Sarah, your lunch for 25 is confirmed for March 14 at 11:30 AM.',
                },
                {
                  time: 'T-24 hr',
                  event: 'Pre-delivery reminder sent',
                  dot: color.orange,
                  detail: 'Reminder: Your catering order arrives tomorrow at 11:30 AM.',
                },
                {
                  time: 'T+0',
                  event: 'Order delivered',
                  dot: color.teal,
                  detail: 'Delivery confirmed by driver.',
                },
                {
                  time: 'T+2 hr',
                  event: 'Satisfaction check-in sent',
                  dot: color.orange,
                  detail: 'How was everything today? Let us know if we can improve.',
                },
                {
                  time: 'T+12 days',
                  event: 'Reorder nudge sent',
                  dot: color.teal,
                  detail: 'Ready to reorder? Your last order for 25 is saved and ready.',
                },
              ].map((item) => (
                <div
                  key={item.time + item.event}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: color.muted, width: 64, flexShrink: 0, fontFamily: 'monospace' }}>
                      {item.time}
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
                    <span style={{ fontSize: 14, color: color.white, fontWeight: 600 }}>{item.event}</span>
                  </div>
                  <div style={{ marginLeft: 84, fontSize: 12, color: color.muted, lineHeight: 1.5 }}>
                    {item.detail}
                  </div>
                </div>
              ))}
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
            Let TrayLoop handle the follow-up.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Automated sequences that keep customers engaged — without adding to your workload.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>
    </>
  );
}
