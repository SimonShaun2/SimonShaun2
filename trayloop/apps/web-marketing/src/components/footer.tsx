import Link from 'next/link';
import PillButton from './pill-button';
import type { CSSProperties } from 'react';

const C = {
  ink: '#1A1612',
  white: '#FEFCFA',
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  orange: '#E85618',
  muted: '#7B6F65',
};

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Recurring Order Automation', href: '/product/recurring-orders' },
      { label: 'Merchant Portal', href: '/product/merchant-portal' },
      { label: 'Smart Pricing', href: '/product/smart-pricing' },
      { label: 'Smart Upsell', href: '/product/smart-upsell' },
      { label: 'Capacity Management', href: '/product/capacity-management' },
      { label: 'Revenue Dashboard', href: '/product/revenue-dashboard' },
    ],
  },
  {
    title: 'Grow Catering Revenue',
    links: [
      { label: 'Direct Ordering', href: '/solutions/direct-ordering' },
      { label: 'Automated Follow Up', href: '/solutions/automated-follow-up' },
      { label: 'AI Reengagement', href: '/solutions/ai-reengagement' },
      { label: 'Smart Upsells', href: '/solutions/smart-upsells' },
      { label: 'Deposit Collection', href: '/solutions/deposit-collection' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'ROI Calculator', href: '/#calculator' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'FAQ', href: '/pricing#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Book a Demo', href: '/demo' },
      { label: 'Login', href: 'https://dashboard.trayloophq.com/login' },
    ],
  },
];

const linkStyle: CSSProperties = {
  fontSize: 14,
  color: C.ink,
  textDecoration: 'none',
  display: 'block',
  marginBottom: 8,
};

const headingStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: C.muted,
  marginBottom: 14,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
};

export default function Footer() {
  return (
    <footer>
      {/* Pre-footer CTA */}
      <section
        style={{
          backgroundColor: C.ink,
          padding: '80px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Every order you take through a marketplace is money you give away.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: C.muted,
              marginBottom: 32,
            }}
          >
            $29/month. No commissions. No contracts. The longer you wait, the more you lose.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <PillButton text="Start Keeping Your Revenue Today →" href="https://dashboard.trayloophq.com/register" variant="primary" />
            <PillButton text="See the System →" href="/product" variant="ghost" />
          </div>
        </div>
      </section>

      {/* Mega footer */}
      <div
        style={{
          backgroundColor: C.white,
          padding: '60px 32px 40px',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Top: Logo + CTAs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 48,
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: C.ink,
                textDecoration: 'none',
              }}
            >
              Tray<span style={{ color: C.orange }}>.</span>Loop
            </Link>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PillButton text="Book a free Demo →" href="/demo" variant="primary" size="sm" />
              <PillButton text="See how it works →" href="/how-it-works" variant="ghost" size="sm" />
            </div>
          </div>

          {/* Link columns */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              flexWrap: 'wrap',
              marginBottom: 48,
            }}
          >
            {columns.map((col) => (
              <div key={col.title} style={{ flex: '1 1 200px', minWidth: 180 }}>
                <div style={headingStyle}>{col.title}</div>
                {col.links.map((link) =>
                  link.href.startsWith('http') ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} style={linkStyle}>
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              backgroundColor: C.creamDark,
              marginBottom: 24,
            }}
          />

          {/* Bottom row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 13, color: C.muted }}>
              &copy; 2025 TrayLoop. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
