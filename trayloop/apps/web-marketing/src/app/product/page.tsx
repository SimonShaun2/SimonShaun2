import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TrayLoop Product — Restaurant Catering Storefront & Management Tools',
    description: 'Explore TrayLoop\'s full product suite: branded catering storefront, automated order management, AI reorder triggers, and revenue dashboard — built for restaurants.',
    alternates: {
          canonical: 'https://trayloophq.com/product',
    },
    openGraph: {
          title: 'TrayLoop Product — Restaurant Catering Storefront & Management Tools',
          description: 'Branded catering storefront, automated order management, AI reorder triggers, and revenue dashboard — built for restaurants.',
          url: 'https://trayloophq.com/product',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'TrayLoop Product — Restaurant Catering Storefront & Management Tools',
          description: 'Branded catering storefront, automated order management, AI reorder triggers, and revenue dashboard — built for restaurants.',
    },
};

import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

/* ── Reusable section wrapper ── */
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

/* ── Teal bullet helper ── */
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

/* ── Mid-section CTA banner ── */
function MidCta() {
  return (
    <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: color.ink, marginBottom: 20 }}>
          See enough? Let us walk you through it live.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
          <PillButton text="See Pricing →" href="/pricing" variant="ghost" />
        </div>
      </div>
    </Section>
  );
}

/* ── Feature data ── */
interface Feature {
  number: string;
  title: string;
  href: string;
  subtitle: string;
  bullets: string[];
  visual: React.ReactNode;
}

const features: Feature[] = [
  {
    number: '01',
    title: 'Recurring Order Automation',
    href: '/product/recurring-orders',
    subtitle: 'Turn one-time orders into a predictable revenue stream',
    bullets: [
      'AI detects reorder patterns',
      'Automated outreach at the right time',
      '$1,840/mo avg recovered',
    ],
    visual: (
      <div
        style={{
          backgroundColor: color.ink,
          borderRadius: 16,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 13, color: color.muted, marginBottom: 4 }}>Impact snapshot</div>
        {[
          { label: '$1,840/mo recovered', accent: color.teal },
          { label: '3\u00d7 repeat orders', accent: color.teal },
          { label: '72% reorder rate', accent: color.teal },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: stat.accent,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: color.white }}>{stat.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '02',
    title: 'Merchant Self-Service Portal',
    href: '/product/merchant-portal',
    subtitle: 'Run your entire catering operation from one dashboard',
    bullets: [
      'Full order management',
      'Customer database with health scores',
      'Self-serve \u2014 no support tickets',
    ],
    visual: (
      <div
        style={{
          backgroundColor: color.white,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${color.creamDark}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
          Portal Modules
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}
        >
          {[
            'Dashboard',
            'Orders',
            'Customers',
            'Offerings',
            'Locations',
            'Follow-Ups',
            'Revenue',
            'Automations',
            'Settings',
          ].map((mod) => (
            <div
              key={mod}
              style={{
                padding: '12px 10px',
                fontSize: 13,
                fontWeight: 600,
                color: color.ink,
                backgroundColor: color.cream,
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              {mod}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Smart Pricing',
    href: '/product/smart-pricing',
    subtitle: 'Price catering based on what actually drives margin',
    bullets: [
      'Per-head, flat-rate, or hybrid models',
      'Minimums and deposits enforced',
      'Location-specific rules',
    ],
    visual: (
      <div
        style={{
          backgroundColor: color.white,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${color.creamDark}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
          Package Example
        </div>
        <div
          style={{
            padding: '20px 18px',
            backgroundColor: '#FFF7F0',
            border: `1.5px solid ${color.orange}`,
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: color.ink, marginBottom: 12 }}>
            Executive Lunch
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            {[
              { label: 'Price', value: '$28/pp' },
              { label: 'Min headcount', value: '15' },
              { label: 'Max headcount', value: '200' },
              { label: 'Deposit', value: '25%' },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ fontSize: 11, color: color.muted }}>{row.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginTop: 2 }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '04',
    title: 'Smart Upsell',
    href: '/product/smart-upsell',
    subtitle: 'Every checkout suggests the right add-ons',
    bullets: [
      'Contextual recommendations',
      '+15% avg order value',
      'Upsell tracking in dashboard',
    ],
    visual: (
      <div
        style={{
          backgroundColor: color.white,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${color.creamDark}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
          Suggested Add-ons
        </div>
        {[
          { item: 'Fresh Fruit Platter', price: '+$4.50/pp' },
          { item: 'Coffee Service', price: '+$3/pp' },
          { item: 'Dessert Tray', price: '+$45' },
        ].map((addon) => (
          <div
            key={addon.item}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              marginBottom: 8,
              borderRadius: 10,
              backgroundColor: '#F0FBF5',
              border: `1.5px solid ${color.teal}`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: color.ink }}>{addon.item}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: color.teal }}>{addon.price}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '05',
    title: 'Capacity Management',
    href: '/product/capacity-management',
    subtitle: 'Never overcommit your kitchen',
    bullets: [
      'Lead time requirements enforced',
      'Delivery radius and zones',
      'Multi-location support',
    ],
    visual: (
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
          { label: 'Max daily catering orders', value: '8' },
          { label: 'Lead time required', value: '24 hours' },
          { label: 'Delivery radius', value: '15 miles' },
          { label: 'Max headcount per order', value: '150' },
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
      </div>
    ),
  },
];

/* ══════════════════════════════════════════════
   PRODUCT PAGE — V2
   ══════════════════════════════════════════════ */
export default function ProductPage() {
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
            The Product
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
            Everything your catering program needs to grow revenue on autopilot.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: color.muted,
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Five core capabilities — each designed to capture more orders, increase order value,
            and turn one-time customers into recurring accounts.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
            <PillButton text="See Pricing →" href="/pricing" variant="ghost" />
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden' }}>
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1100&h=400&fit=crop"
              alt="Catering spread"
              width={1100}
              height={400}
              style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </Section>

      {/* ── FEATURE CARDS ── */}
      {features.map((feature, i) => {
        const isEven = i % 2 === 1;
        const bg = i % 2 === 0 ? color.white : color.cream;

        const textBlock = (
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 10,
              }}
            >
              {feature.number}
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: color.ink,
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {feature.title}
            </h2>
            <p style={{ fontSize: 18, color: color.muted, marginBottom: 24, lineHeight: 1.5 }}>
              {feature.subtitle}
            </p>
            <ul style={{ padding: 0, marginBottom: 24 }}>
              {feature.bullets.map((b) => (
                <BulletItem key={b} text={b} />
              ))}
            </ul>
            <Link
              href={feature.href}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: color.orange,
                textDecoration: 'none',
              }}
            >
              Learn more →
            </Link>
          </div>
        );

        const visualBlock = (
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>{feature.visual}</div>
        );

        return (
          <div key={feature.number}>
            <Section bg={bg}>
              <div
                style={{
                  display: 'flex',
                  gap: 48,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  flexDirection: isEven ? 'row-reverse' : 'row',
                }}
              >
                {textBlock}
                {visualBlock}
              </div>
            </Section>

            {/* Mid-section CTA after feature 2 (index 1) and feature 4 (index 3) */}
            {(i === 1 || i === 3) && <MidCta />}
          </div>
        );
      })}

      {/* ── PLATFORM OVERVIEW ── */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto', marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            One platform. Five capabilities. Zero commissions.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {[
            { value: '$49/month', label: 'flat' },
            { value: '0%', label: 'commissions' },
            { value: '100%', label: 'done-for-you setup' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: color.white, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 15, color: '#C2B9AE' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

    </main>
  );
}
