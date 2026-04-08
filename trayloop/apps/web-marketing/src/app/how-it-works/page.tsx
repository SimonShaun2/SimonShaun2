'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

/* ── Design tokens ── */
const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

/* ── Helpers ── */
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

function Label({ text, color = C.orange }: { text: string; color?: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: 12,
      }}
    >
      {text}
    </div>
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
        backgroundColor: C.teal,
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
      <span style={{ color: C.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

function XItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14, listStyle: 'none' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#FDEAEA',
          color: C.red,
          fontSize: 13,
          fontWeight: 700,
          marginRight: 10,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        &#10005;
      </span>
      <span style={{ color: C.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 12,
        padding: '20px 24px',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{q}</p>
        <span
          style={{
            fontSize: 20,
            color: C.muted,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          +
        </span>
      </div>
      {open && (
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginTop: 12 }}>{a}</p>
      )}
    </div>
  );
}

/* ── FAQ data ── */
const faqs = [
  {
    q: 'How does TrayLoop differ from catering marketplaces?',
    a: 'Marketplaces own the customer relationship and charge 20-30% commissions on every order. TrayLoop gives you a branded direct ordering channel where you keep 100% of your revenue minus only a flat $49/month and 5% processing fee. You own the data, the relationship, and the revenue.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most restaurants are live within 48 hours. Our team handles menu setup, branding, and technical configuration so you can focus on cooking. It is a fully done-for-you onboarding experience.',
  },
  {
    q: 'Do I need technical skills to use TrayLoop?',
    a: 'Not at all. We handle the full setup and your dashboard is designed to be as simple as checking your email. If you can use a smartphone, you can use TrayLoop.',
  },
  {
    q: 'What does the AI actually do?',
    a: 'Our AI detects reorder patterns, predicts when customers are likely to order again, flags at-risk accounts before they churn, generates personalized follow-up messages, and recommends upsell opportunities. It runs in the background so your catering program grows without manual effort.',
  },
  {
    q: 'How does TrayLoop make money if there are no commissions?',
    a: 'We charge a flat $49/month subscription plus 5% payment processing. That is the entire cost. We make money when you succeed, not by taking a cut of every order.',
  },
  {
    q: 'Can I still use marketplaces alongside TrayLoop?',
    a: 'Absolutely. TrayLoop is additive, not a replacement. Keep your existing marketplace presence while building a direct channel that you own and control. Over time, most restaurants naturally shift their best accounts to direct ordering because the economics are dramatically better.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'There are no contracts and no cancellation fees. You can cancel any time from your dashboard. Your storefront stays live through the end of your billing period, and you can export all your customer data at any point.',
  },
];

/* ══════════════════════════════════════════════
   HOW IT WORKS PAGE
   ══════════════════════════════════════════════ */
export default function HowItWorksPage() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <Section bg={C.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
          <Label text="Product" />
          <h1
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            The system behind every high-performing catering program
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: C.muted, marginBottom: 48 }}>
            Turn scattered catering orders into a predictable revenue stream.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '100%', label: 'of revenue stays yours' },
              { value: '3\u00d7', label: 'repeat order rate' },
              { value: '100%', label: 'done-for-you setup' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', flex: '0 1 200px' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.ink }}>{s.value}</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 2. THE LOOP ── */}
      <Section bg={C.creamDark}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Label text="How It Works" />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.2,
              maxWidth: 680,
              margin: '0 auto 16px',
            }}
          >
            One order starts the loop. The system takes it from there.
          </h2>
        </div>

        {/* 6 step cards */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 0,
          }}
        >
          {[
            { title: 'Order In', highlight: false },
            { title: 'Deposit Collected', highlight: false },
            { title: 'Order Confirmed', highlight: false },
            { title: 'Fulfilled', highlight: false },
            { title: 'Follow Up Sent', highlight: false },
            { title: 'Reorder Triggered', highlight: true },
          ].map((step, i) => (
            <div key={step.title} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: step.highlight ? C.orange : C.white,
                  color: step.highlight ? C.white : C.ink,
                  borderRadius: 12,
                  padding: '20px 22px',
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: 'center',
                  minWidth: 130,
                  border: step.highlight ? 'none' : `1px solid ${C.creamDark}`,
                }}
              >
                {step.title}
              </div>
              {i < 5 && (
                <span
                  style={{
                    fontSize: 20,
                    color: C.muted,
                    margin: '0 8px',
                    flexShrink: 0,
                  }}
                >
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 15,
            color: C.muted,
            marginTop: 32,
            fontStyle: 'italic',
          }}
        >
          Most restaurants break the loop after fulfillment. TrayLoop closes it automatically.
        </p>
      </Section>

      {/* ── 3. FEATURE 1 — Direct Ordering (01) ── */}
      <Section bg={C.cream}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 10 }}>01</div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              Your Branded Direct Ordering Channel
            </h2>
            <ul style={{ padding: 0, marginBottom: 20 }}>
              <BulletItem text="Custom URL for your restaurant" />
              <BulletItem text="Package builder with add-ons and minimums" />
              <BulletItem text="Upfront deposit collected automatically" />
              <BulletItem text="No commission on any order ever" />
            </ul>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: 16,
                padding: 28,
                border: `1px solid ${C.creamDark}`,
              }}
            >
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Your storefront</div>
              <div
                style={{
                  backgroundColor: C.cream,
                  borderRadius: 10,
                  padding: '14px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 16,
                  fontFamily: 'monospace',
                }}
              >
                order.trayloophq.com/rosarios-kitchen
              </div>
              {[
                { label: 'Standard Lunch', price: '$18/person' },
                { label: 'Premium Lunch', price: '$26/person' },
                { label: 'Executive Package', price: '$38/person' },
              ].map((p) => (
                <div
                  key={p.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: `1px solid ${C.creamDark}`,
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: C.ink }}>{p.label}</span>
                  <span style={{ fontWeight: 600, color: C.ink }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. FEATURE 2 — Automation (02) ── */}
      <Section bg={C.white}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
            flexDirection: 'row-reverse',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 10 }}>02</div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              Operations That Run Without You
            </h2>
            <ul style={{ padding: 0 }}>
              <BulletItem text="Instant order confirmation" />
              <BulletItem text="Automated pre-order reminder" />
              <BulletItem text="Post-delivery follow up queued" />
              <BulletItem text="Lead time enforcement" />
            </ul>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: C.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                Automation Timeline
              </div>
              {[
                { time: 'T+0', event: 'Order received & confirmed', dot: C.teal },
                { time: 'T+1h', event: 'Deposit collected automatically', dot: C.teal },
                { time: 'T-24h', event: 'Pre-order reminder sent to kitchen', dot: C.orange },
                { time: 'T+1d', event: 'Post-delivery follow-up queued', dot: C.teal },
                { time: 'T+14d', event: 'Reorder suggestion sent', dot: C.orange },
              ].map((item) => (
                <div
                  key={item.time + item.event}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted, width: 48, flexShrink: 0, fontFamily: 'monospace' }}>
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
                  <span style={{ fontSize: 14, color: C.white }}>{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. FEATURE 3 — Intelligence (03) ── */}
      <Section bg={C.cream}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 10 }}>03</div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              AI That Knows When to Reach Out
            </h2>
            <div style={{ fontSize: 13, color: C.teal, marginBottom: 20 }}>Assisted by AI</div>
            <ul style={{ padding: 0 }}>
              <BulletItem text="Pattern detection for reorder cycles" />
              <BulletItem text="Proactive outreach before windows close" />
              <BulletItem text="Revenue gap alerts" />
              <BulletItem text="Dormant account recovery" />
            </ul>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: C.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                AI Insights — Apex Financial
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(66,217,160,0.1)',
                  borderRadius: 10,
                  padding: '16px 18px',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, marginBottom: 4 }}>
                  Reorder Prediction
                </div>
                <div style={{ fontSize: 15, color: C.white }}>
                  Apex Financial orders every 14 days. Next order window opens in 2 days.
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(232,86,24,0.1)',
                  borderRadius: 10,
                  padding: '16px 18px',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginBottom: 4 }}>
                  Revenue Gap Alert
                </div>
                <div style={{ fontSize: 15, color: C.white }}>
                  3 accounts have not ordered in 30+ days. Estimated lost revenue: $2,400/mo.
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(66,217,160,0.1)',
                  borderRadius: 10,
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, marginBottom: 4 }}>
                  Dormant Recovery
                </div>
                <div style={{ fontSize: 15, color: C.white }}>
                  Re-engagement email sent to Metro Law Group. Last order: 45 days ago.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 6. FEATURE 4 — Dashboard (04) ── */}
      <Section bg={C.white}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
            flexDirection: 'row-reverse',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 10 }}>04</div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              A Revenue Dashboard That Tells You What Matters
            </h2>
            <ul style={{ padding: 0 }}>
              <BulletItem text="Monthly recurring revenue by account" />
              <BulletItem text="At-risk accounts flagged" />
              <BulletItem text="Revenue recovered from reengagement" />
              <BulletItem text="Upcoming order pipeline with deposit status" />
            </ul>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: C.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                Revenue Dashboard
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: 'Monthly Revenue', value: '$18,400', change: '+23%' },
                  { label: 'At-Risk Accounts', value: '3', change: 'flagged' },
                  { label: 'Recovered Revenue', value: '$4,200', change: 'this quarter' },
                  { label: 'Pipeline Value', value: '$6,800', change: '8 orders' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      backgroundColor: '#2A2520',
                      borderRadius: 10,
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ fontSize: 11, color: C.muted }}>{kpi.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.white, marginTop: 4 }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>{kpi.change}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. MID CTA ── */}
      <Section bg={C.cream} style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="Book a free Demo &rarr;" href="/demo" variant="primary" />
          <PillButton text="See pricing &rarr;" href="/pricing" variant="ghost" />
        </div>
      </Section>

      {/* ── 8. REVENUE GROWTH ENGINE ── */}
      <Section bg={C.ink}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Label text="Built for Recurring Revenue" />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.white,
              lineHeight: 1.2,
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            The tools that turn one-time catering orders into a predictable revenue stream.
          </h2>
        </div>

        {/* Alternating feature rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[
            {
              title: 'Recurring accounts, not one-off orders',
              desc: 'TrayLoop tracks order patterns and automatically re-engages customers at the right time, turning single orders into recurring accounts.',
              stat: '3\u00d7',
              statLabel: 'repeat order rate',
              ai: 'Assisted by AI: pattern detection',
              reverse: false,
            },
            {
              title: 'At-risk customers caught before they churn',
              desc: 'The system flags accounts showing early signs of churn so you can act before they disappear.',
              stat: '$1,840/mo',
              statLabel: 'revenue recovered',
              ai: 'Assisted by AI: health scoring',
              reverse: true,
            },
            {
              title: 'Outreach that writes itself',
              desc: 'AI generates personalized follow-ups, proposals, and re-engagement messages based on each account\u2019s history.',
              stat: '1 click',
              statLabel: 'to send personalized outreach',
              ai: 'Assisted by AI: generates copy',
              reverse: false,
            },
            {
              title: 'Revenue visibility you\u2019ve never had',
              desc: 'See monthly recurring revenue, pipeline value, at-risk accounts, and recovered revenue in one dashboard.',
              stat: '100%',
              statLabel: 'revenue visibility',
              ai: 'Assisted by AI: insights',
              reverse: true,
            },
            {
              title: 'Every order gets bigger with smart upsells',
              desc: 'Contextual add-on suggestions at checkout increase average order value without any manual quoting.',
              stat: '+15%',
              statLabel: 'avg order value increase',
              ai: 'Assisted by AI: learns add-on conversions',
              reverse: false,
            },
          ].map((row) => (
            <div
              key={row.title}
              style={{
                display: 'flex',
                gap: 32,
                flexWrap: 'wrap',
                alignItems: 'center',
                flexDirection: row.reverse ? 'row-reverse' : 'row',
              }}
            >
              <div style={{ flex: '1 1 500px', minWidth: 280 }}>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.white,
                    lineHeight: 1.3,
                    marginBottom: 12,
                  }}
                >
                  {row.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#C2B9AE', marginBottom: 12 }}>
                  {row.desc}
                </p>
                <div style={{ fontSize: 13, color: C.teal }}>{row.ai}</div>
              </div>
              <div style={{ flex: '0 1 280px', minWidth: 200 }}>
                <div
                  style={{
                    backgroundColor: '#2A2520',
                    borderRadius: 16,
                    padding: 32,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 48, fontWeight: 800, color: C.white }}>{row.stat}</div>
                  <div style={{ fontSize: 14, color: '#C2B9AE', marginTop: 4 }}>{row.statLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 56,
          }}
        >
          <PillButton text="Book a free Demo &rarr;" href="/demo" variant="primary" />
          <PillButton text="See pricing &rarr;" href="/pricing" variant="ghost" />
        </div>
      </Section>

      {/* ── 9. CRM COMPARISON ── */}
      <Section bg={C.ink} style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Label text="The Difference" />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.white,
              lineHeight: 1.2,
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            This is not a CRM. CRMs are where data goes to sit.
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            maxWidth: 880,
            margin: '0 auto',
          }}
        >
          {/* Traditional CRM */}
          <div
            style={{
              flex: '1 1 380px',
              backgroundColor: '#2A2520',
              borderRadius: 16,
              padding: 32,
              opacity: 0.85,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: C.muted,
                marginBottom: 20,
              }}
            >
              Traditional CRM
            </div>
            <ul style={{ padding: 0 }}>
              {[
                'You manually log every interaction',
                'You write and send every follow-up',
                'No automated reorder triggers',
                'No deposit collection',
                'No ordering portal',
                'Data sits in fields nobody checks',
              ].map((t) => (
                <li
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 14,
                    listStyle: 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,98,67,0.15)',
                      color: C.red,
                      fontSize: 11,
                      fontWeight: 700,
                      marginRight: 10,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    &#10005;
                  </span>
                  <span style={{ color: '#C2B9AE', fontSize: 15, lineHeight: 1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TrayLoop */}
          <div
            style={{
              flex: '1 1 380px',
              backgroundColor: '#2A2520',
              borderRadius: 16,
              padding: 32,
              border: `2px solid ${C.orange}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: C.orange,
                marginBottom: 20,
              }}
            >
              TrayLoop
            </div>
            <ul style={{ padding: 0 }}>
              {[
                'Every interaction logged automatically',
                'AI writes and sends follow-ups for you',
                'Automated reorder triggers based on patterns',
                'Deposits collected at checkout',
                'Branded ordering portal included',
                'Data drives actions, not just reports',
              ].map((t) => (
                <li
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 14,
                    listStyle: 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.teal,
                      marginRight: 10,
                      flexShrink: 0,
                      marginTop: 7,
                    }}
                  />
                  <span style={{ color: C.white, fontSize: 15, lineHeight: 1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: C.muted,
            marginTop: 32,
            fontStyle: 'italic',
          }}
        >
          A CRM tracks what happened. TrayLoop makes things happen.
        </p>
      </Section>

      {/* ── 10. FAQ ── */}
      <Section bg={C.cream}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Label text="FAQ" />
          <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink }}>Common questions</h2>
        </div>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </Section>

    </>
  );
}
