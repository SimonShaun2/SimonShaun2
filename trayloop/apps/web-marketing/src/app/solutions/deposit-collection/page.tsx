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

export default function DepositCollectionPage() {
  const costCards = [
    {
      emoji: '\u{1F6AB}',
      title: 'No-shows',
      desc: 'Customers cancel last minute after you\'ve already prepped. Food wasted, staff idle, revenue gone.',
      stat: '$640/mo lost',
    },
    {
      emoji: '\u{1F4DE}',
      title: 'Invoice chasing',
      desc: 'Hours spent sending reminders, following up on unpaid invoices, and reconciling payments.',
      stat: '2\u20133 hrs/week',
    },
    {
      emoji: '\u{1F4B8}',
      title: 'Cash flow gaps',
      desc: 'Large orders tie up your capital. You\'re buying ingredients before you\'ve been paid a cent.',
      stat: '$2,000\u2013$5,000 tied up',
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'Set deposit rules',
      desc: 'Choose your deposit percentage (25%, 50%, or custom) and which order types require deposits.',
    },
    {
      num: 2,
      title: 'Customer pays at checkout',
      desc: 'Deposits are collected automatically via Stripe when the customer places their order. No awkward conversations.',
    },
    {
      num: 3,
      title: 'Order confirmed with deposit',
      desc: 'The order is confirmed only after the deposit clears. Both you and the customer get confirmation.',
    },
    {
      num: 4,
      title: 'Remaining balance at delivery',
      desc: 'The remaining amount is collected on delivery day. Clear, professional, and automatic.',
    },
  ];

  const orderLines = [
    { label: 'Premium Lunch (30 guests)', value: '$720.00' },
    { label: 'Beverage Package', value: '$135.00' },
    { label: 'Delivery Fee', value: '$43.50' },
  ];

  const impactCards = [
    {
      title: 'Money upfront',
      desc: 'Deposits hit your account before you start prepping. Predictable cash flow from day one.',
      stat: '$2,500/mo working capital',
    },
    {
      title: 'No-show protection',
      desc: 'When customers have skin in the game, they show up. Cancellations drop dramatically.',
      stat: '85% reduction',
    },
    {
      title: 'Professional checkout',
      desc: 'A branded, Stripe-powered checkout that builds trust and gets you paid faster.',
      stat: '30 sec to payment',
    },
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
            Deposit Collection
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
            Collect deposits automatically. Eliminate no-shows.
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
            No-shows and last-minute cancellations cost caterers thousands every
            year. TrayLoop collects deposits at checkout via Stripe so you&apos;re
            protected before you start prepping.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=900&h=400&fit=crop"
          alt="Food truck serving customers"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── COST OF NO DEPOSITS ── */}
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
          The cost of not collecting deposits
        </h2>
        <p
          style={{
            fontSize: 16,
            color: color.muted,
            textAlign: 'center',
            maxWidth: 520,
            margin: '0 auto 48px',
            lineHeight: 1.5,
          }}
        >
          Every unprotected order is a risk to your bottom line.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {costCards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5, marginBottom: 16 }}>
                {card.desc}
              </div>
              <div
                style={{
                  backgroundColor: '#FFF0EC',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: color.orange,
                  textAlign: 'center',
                }}
              >
                {card.stat}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section bg={color.white}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                backgroundColor: color.cream,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
                textAlign: 'center',
              }}
            >
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
                  margin: '0 auto 16px',
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CHECKOUT MOCKUP (dark bg) ── */}
      <Section bg={color.ink}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.white,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          A checkout experience customers trust
        </h2>
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            backgroundColor: color.white,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header bar */}
          <div
            style={{
              backgroundColor: color.ink,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: color.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: color.ink,
              }}
            >
              T
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: color.white }}>
              Downtown Kitchen
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 20px' }}>
            {/* Deposit amount */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: color.muted, marginBottom: 4 }}>
                Deposit due now
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: color.ink }}>
                $224.63
              </div>
            </div>

            {/* Order summary */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: color.muted,
                letterSpacing: 1,
                textTransform: 'uppercase' as const,
                marginBottom: 12,
              }}
            >
              Order Summary
            </div>
            {orderLines.map((line) => (
              <div
                key={line.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                  color: color.ink,
                  borderBottom: `1px solid ${color.creamDark}`,
                }}
              >
                <span>{line.label}</span>
                <span style={{ fontWeight: 600 }}>{line.value}</span>
              </div>
            ))}

            {/* Totals */}
            <div style={{ marginTop: 12, marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                <span>Order Total</span>
                <span>$898.50</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: color.teal,
                }}
              >
                <span>Deposit (25%)</span>
                <span>$224.63</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                  color: color.muted,
                }}
              >
                <span>Due at delivery</span>
                <span>$673.87</span>
              </div>
            </div>

            {/* Pay button */}
            <div
              style={{
                padding: '16px',
                backgroundColor: color.orange,
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: color.white,
                marginBottom: 12,
              }}
            >
              Pay Deposit
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: color.muted }}>
              Secured by Stripe &middot; PCI-compliant
            </div>
          </div>
        </div>
      </Section>

      {/* ── CASH FLOW IMPACT ── */}
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
          The cash flow impact
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {impactCards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5, marginBottom: 16 }}>
                {card.desc}
              </div>
              <div
                style={{
                  backgroundColor: '#EDFBF4',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: color.teal,
                  textAlign: 'center',
                }}
              >
                {card.stat}
              </div>
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
          <PillButton text="Book a free Demo &rarr;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
