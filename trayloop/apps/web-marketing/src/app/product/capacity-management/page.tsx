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

export default function CapacityManagementPage() {
  const problems = [
    { emoji: '\u{1F630}', title: 'Last-minute orders', desc: 'Customers placing orders with no lead time, forcing your kitchen to scramble or decline.' },
    { emoji: '\u{1F69A}', title: 'Out-of-range deliveries', desc: 'Accepting orders outside your delivery area, burning time and fuel on impossible routes.' },
    { emoji: '\u{1F465}', title: 'Impossible headcounts', desc: 'An order for 500 people when your kitchen tops out at 150. No guardrails means chaos.' },
    { emoji: '\u{1F4DE}', title: 'Manual gatekeeping', desc: 'You or your staff manually screening every order to check if you can actually fulfill it.' },
  ];

  const rules = [
    {
      emoji: '\u{1F4C5}',
      title: 'Lead Time Requirements',
      desc: 'Set minimum notice per location. Orders placed too late are automatically blocked with a clear message.',
      example: 'e.g. "48-hour minimum for orders over 50 people"',
    },
    {
      emoji: '\u{1F5FA}\uFE0F',
      title: 'Delivery Radius & Zones',
      desc: 'Draw your delivery boundary by miles or zip codes. Out-of-range customers see availability for pickup instead.',
      example: 'e.g. "15-mile radius from Main Kitchen, 8-mile from Satellite"',
    },
    {
      emoji: '\u{1F465}',
      title: 'Headcount Limits',
      desc: 'Cap the minimum and maximum guests per order. Prevents tiny orders that lose money and huge ones you can\'t fulfill.',
      example: 'e.g. "Min 10, Max 200 per single order"',
    },
    {
      emoji: '\u23F0',
      title: 'Operating Hours',
      desc: 'Define when each location accepts orders and deliveries. Outside those windows, the storefront shows the next available slot.',
      example: 'e.g. "Mon\u2013Fri 6 AM \u2013 4 PM, Sat 8 AM \u2013 2 PM"',
    },
    {
      emoji: '\u{1F3E2}',
      title: 'Multi-Location Rules',
      desc: 'Each location gets its own independent capacity settings. What works downtown doesn\'t have to match the suburbs.',
      example: 'e.g. "Downtown: 24hr lead, Satellite: 48hr lead"',
    },
    {
      emoji: '\u{1F697}',
      title: 'Service Type Controls',
      desc: 'Enable or disable delivery, pickup, and on-site catering per location. Full control over how customers order.',
      example: 'e.g. "Food Truck: pickup only, Main Kitchen: delivery + pickup"',
    },
  ];

  const locations = [
    {
      name: 'Downtown Kitchen',
      city: 'Austin, TX',
      lead: '24 hrs',
      radius: '15 mi',
      hours: '6 AM \u2013 4 PM',
      capacity: '8 orders/day',
      status: 'Active',
      statusIcon: '\u2713',
      statusColor: color.teal,
    },
    {
      name: 'Satellite Kitchen',
      city: 'Round Rock, TX',
      lead: '48 hrs',
      radius: '8 mi',
      hours: '7 AM \u2013 3 PM',
      capacity: '5 orders/day',
      status: 'Active',
      statusIcon: '\u2713',
      statusColor: color.teal,
    },
    {
      name: 'Food Truck',
      city: 'Mobile',
      lead: '72 hrs',
      radius: '10 mi',
      hours: '10 AM \u2013 6 PM',
      capacity: '3 orders/day',
      status: 'Paused',
      statusIcon: '\u23F8',
      statusColor: color.orange,
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
            Never overcommit your kitchen
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
            Set lead times, operating hours, delivery zones, and headcount limits
            per location. TrayLoop automatically blocks orders when you&apos;re at
            capacity and opens slots when you&apos;re free.
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

      {/* ── THE PROBLEM ── */}
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
          The problems capacity rules solve
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
          Without guardrails, every order is a gamble.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {problems.map((p) => (
            <div
              key={p.title}
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{p.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SIX CAPACITY RULES ── */}
      <Section bg={color.white}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Six capacity rules, fully configurable
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
          Each rule works independently per location. Mix and match to fit your operation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {rules.map((rule, i) => (
            <div
              key={rule.title}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 40,
                flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
                alignItems: 'center',
              }}
            >
              {/* Text side */}
              <div style={{ flex: '1 1 440px', minWidth: 280 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{rule.emoji}</div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: color.ink,
                    marginBottom: 10,
                  }}
                >
                  {rule.title}
                </h3>
                <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6, marginBottom: 14 }}>
                  {rule.desc}
                </p>
                <div
                  style={{
                    backgroundColor: color.creamDark,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: color.muted,
                    fontStyle: 'italic',
                  }}
                >
                  {rule.example}
                </div>
              </div>

              {/* Visual mockup side */}
              <div style={{ flex: '1 1 440px', minWidth: 280 }}>
                <div
                  style={{
                    backgroundColor: color.cream,
                    borderRadius: 14,
                    padding: '40px 24px',
                    textAlign: 'center',
                    border: `1px solid ${color.creamDark}`,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{rule.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: color.ink }}>
                    {rule.title}
                  </div>
                  <div style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>
                    Configuration preview
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── MULTI-LOCATION (dark bg) ── */}
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
          Independent rules per location
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
          Each site runs on its own settings. Pause, adjust, or scale independently.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {locations.map((loc) => (
            <div
              key={loc.name}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: color.white }}>
                    {loc.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#C2B9AE', marginTop: 2 }}>
                    {loc.city}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: loc.statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{loc.statusIcon}</span> {loc.status}
                </div>
              </div>
              {[
                { label: 'Lead time', value: loc.lead },
                { label: 'Radius', value: loc.radius },
                { label: 'Hours', value: loc.hours },
                { label: 'Capacity', value: loc.capacity },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#C2B9AE' }}>{row.label}</span>
                  <span style={{ color: color.white, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.ink,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Take control of your kitchen capacity.
          </h2>
          <p style={{ fontSize: 16, color: color.muted, marginBottom: 32 }}>
            See how Capacity Management keeps your operation running smoothly at
            every location.
          </p>
          <PillButton text="Book a free Demo &rarr;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
