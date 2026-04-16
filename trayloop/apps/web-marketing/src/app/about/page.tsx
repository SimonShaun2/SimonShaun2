import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About TrayLoop — Commission-Free Catering Platform for Restaurants',
    description: 'Learn how TrayLoop helps restaurants own their catering revenue with a branded storefront, zero commissions, and AI-powered reorder tools. Built for growth.',
    alternates: {
          canonical: 'https://trayloophq.com/about',
    },
    openGraph: {
          title: 'About TrayLoop — Commission-Free Catering Platform for Restaurants',
          description: 'Learn how TrayLoop helps restaurants own their catering revenue with a branded storefront, zero commissions, and AI-powered reorder tools.',
          url: 'https://trayloophq.com/about',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'About TrayLoop — Commission-Free Catering Platform for Restaurants',
          description: 'Learn how TrayLoop helps restaurants own their catering revenue with a branded storefront, zero commissions, and AI-powered reorder tools.',
    },
};

import type { CSSProperties } from 'react';
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

export default function AboutPage() {
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
            About TrayLoop
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
            We&apos;re building the operating system for catering revenue.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted }}>
            Restaurants deserve to own their catering customers — not rent them from a marketplace.
            TrayLoop gives every restaurant a direct channel to their catering accounts with the
            tools to grow, retain, and automate that revenue.
          </p>
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"
          alt="Team working together"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── MISSION ── */}
      <Section bg={color.white}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.3, marginBottom: 20 }}>
            Our mission
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: color.muted, marginBottom: 16 }}>
            The catering industry is worth $60 billion, but most of that revenue flows through
            middlemen who take 15 to 30% commissions and own the customer relationship. Restaurants do
            the hard work — sourcing ingredients, cooking the food, delivering on time — but someone
            else captures the data, the repeat orders, and a massive cut of the revenue.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: color.muted, marginBottom: 16 }}>
            We started TrayLoop because we believe restaurants should own their catering business end
            to end. That means owning the customer data, the ordering experience, the follow up, and
            the revenue. No commissions. No middlemen. Just a direct line between restaurants and the
            companies that rely on them.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: color.muted }}>
            We built TrayLoop to be the infrastructure layer for restaurant catering — handling
            everything from storefront and checkout to automated follow up and AI assisted
            reengagement. So restaurants can focus on what they do best: making great food.
          </p>
        </div>
      </Section>

      {/* ── VALUES ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
            What we stand for
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            maxWidth: 960,
            margin: '0 auto',
          }}
        >
          {[
            {
              title: 'No commissions',
              description:
                'Restaurants keep their revenue. We charge a flat monthly fee and a small platform fee — never a per order commission. Your margins are yours.',
              accent: color.teal,
            },
            {
              title: 'AI assisted',
              description:
                'We use AI where it actually helps — predicting reorder windows, flagging at risk accounts, generating outreach. Not buzzwords. Real tools that save time and recover revenue.',
              accent: color.orange,
            },
            {
              title: 'Restaurant focused',
              description:
                'Every feature we build starts with a simple question: does this help the restaurant grow? If the answer is no, we don\'t build it. Our success is measured by our customers\' revenue.',
              accent: color.teal,
            },
          ].map((value) => (
            <div
              key={value.title}
              style={{
                padding: '32px 28px',
                backgroundColor: color.white,
                borderRadius: 14,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: value.accent,
                  marginBottom: 16,
                }}
              />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: color.ink, marginBottom: 10 }}>
                {value.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: color.muted, margin: 0 }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

    </>
  );
}
