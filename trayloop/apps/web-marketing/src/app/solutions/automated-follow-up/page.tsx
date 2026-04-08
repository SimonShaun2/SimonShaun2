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

export default function AutomatedFollowUpPage() {
  const genericRows = [
    'Triggered by manual campaigns',
    'Generic content templates',
    'Sent when you remember to set it up',
    'Personalized with first name only',
    'Separate system from your orders',
  ];

  const trayloopRows = [
    'Triggered by order events automatically',
    'Order-specific content with real details',
    'Timed automatically based on delivery date',
    'Full order details, history, and preferences',
    'IS the order system \u2014 no sync needed',
  ];

  const sequence = [
    {
      num: 1,
      trigger: 'Order submitted',
      action: 'Confirmation email + SMS sent',
      timing: 'Instant',
      desc: 'Customer receives order details, delivery date, and a link to modify. You get a new-order notification.',
    },
    {
      num: 2,
      trigger: '48 hours before delivery',
      action: 'Pre-delivery reminder sent',
      timing: 'T\u221248 hrs',
      desc: 'Customer is reminded of the upcoming delivery with time, headcount, and any special instructions confirmed.',
    },
    {
      num: 3,
      trigger: 'Order fulfilled',
      action: 'Post-delivery check-in sent',
      timing: 'T+2 hrs',
      desc: 'A quick satisfaction check-in asks how everything went and if anything needs attention.',
    },
    {
      num: 4,
      trigger: '7 days after delivery',
      action: 'Feedback + reorder nudge sent',
      timing: 'T+7 days',
      desc: 'Customer receives a thank-you with a one-click reorder link pre-filled with their last order.',
    },
    {
      num: 5,
      trigger: 'AI detects reorder window',
      action: 'Smart reorder campaign queued',
      timing: 'AI-timed',
      desc: 'Based on the customer\'s ordering cadence, TrayLoop queues a reorder nudge at exactly the right moment.',
    },
  ];

  const customerGets = [
    'Order confirmation with full details',
    'Pre-delivery reminder with schedule',
    'Post-delivery satisfaction check-in',
    'One-click reorder link',
    'AI-timed nudge at their reorder window',
  ];

  const youGet = [
    'New order notification',
    'Delivery prep reminder',
    'Customer feedback alert',
    'Reorder conversion notification',
    'Weekly engagement summary',
  ];

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
            Automated Follow-Up
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
            Every order triggers a sequence. Every customer gets followed up.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: color.muted,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Most catering customers churn because no one follows up. TrayLoop
            automates every touchpoint so your customers feel taken care of and
            keep coming back.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=400&fit=crop"
          alt="Restaurant owner greeting customers"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── NOT EMAIL MARKETING ── */}
      <Section bg={color.creamDark}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          This isn&apos;t email marketing
        </h2>
        <p
          style={{
            fontSize: 16,
            color: color.muted,
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto 48px',
            lineHeight: 1.5,
          }}
        >
          Generic blast tools don&apos;t know what your customer ordered. TrayLoop does.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          {/* Generic side */}
          <div
            style={{
              flex: '1 1 440px',
              maxWidth: 520,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: '28px 24px',
              border: `1px solid ${color.creamDark}`,
              opacity: 0.7,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: color.muted,
                marginBottom: 20,
                textTransform: 'uppercase' as const,
                letterSpacing: 0.8,
              }}
            >
              Generic Email Automation
            </div>
            {genericRows.map((row) => (
              <div
                key={row}
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${color.creamDark}`,
                  fontSize: 14,
                  color: color.muted,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span style={{ color: color.muted, flexShrink: 0 }}>&times;</span>
                {row}
              </div>
            ))}
          </div>

          {/* TrayLoop side */}
          <div
            style={{
              flex: '1 1 440px',
              maxWidth: 520,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: '28px 24px',
              border: `2px solid ${color.teal}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: color.teal,
                marginBottom: 20,
                textTransform: 'uppercase' as const,
                letterSpacing: 0.8,
              }}
            >
              TrayLoop Automated Follow-Up
            </div>
            {trayloopRows.map((row) => (
              <div
                key={row}
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${color.creamDark}`,
                  fontSize: 14,
                  color: color.ink,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <TealDot />
                {row}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── THE SEQUENCE (dark bg) ── */}
      <Section bg={color.ink}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.white,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          The sequence
        </h2>
        <p
          style={{
            fontSize: 16,
            color: '#C2B9AE',
            textAlign: 'center',
            maxWidth: 520,
            margin: '0 auto 48px',
            lineHeight: 1.5,
          }}
        >
          Five touchpoints, fully automated, triggered by real order events.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sequence.map((step) => (
            <div
              key={step.num}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                alignItems: 'flex-start',
              }}
            >
              {/* Number */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: color.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  color: color.ink,
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>

              {/* Content */}
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#C2B9AE' }}>{step.trigger}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: color.ink, backgroundColor: color.teal, borderRadius: 20, padding: '3px 10px' }}>
                    {step.timing}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: color.teal, marginBottom: 6 }}>
                  {step.action}
                </div>
                <div style={{ fontSize: 14, color: '#C2B9AE', lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── BOTH SIDES GET NOTIFIED ── */}
      <Section bg={color.creamDark}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Both sides get notified
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          {/* Customer gets */}
          <div
            style={{
              flex: '1 1 440px',
              maxWidth: 520,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: '28px 24px',
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 20,
                textTransform: 'uppercase' as const,
                letterSpacing: 0.8,
              }}
            >
              Customer Gets
            </div>
            {customerGets.map((item) => (
              <div
                key={item}
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${color.creamDark}`,
                  fontSize: 14,
                  color: color.ink,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <TealDot />
                {item}
              </div>
            ))}
          </div>

          {/* You get */}
          <div
            style={{
              flex: '1 1 440px',
              maxWidth: 520,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: '28px 24px',
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 20,
                textTransform: 'uppercase' as const,
                letterSpacing: 0.8,
              }}
            >
              You Get
            </div>
            {youGet.map((item) => (
              <div
                key={item}
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${color.creamDark}`,
                  fontSize: 14,
                  color: color.ink,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: color.orange,
                    marginRight: 10,
                    flexShrink: 0,
                    marginTop: 7,
                  }}
                />
                {item}
              </div>
            ))}
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
            Automated sequences that keep customers engaged &mdash; without adding
            to your workload.
          </p>
          <PillButton text="Book a free Demo &rarr;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
