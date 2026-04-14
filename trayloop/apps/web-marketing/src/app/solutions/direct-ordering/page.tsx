import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Direct Catering Orders for Restaurants - No Commissions | TrayLoop',
    description: 'Give your restaurant a branded direct catering ordering channel. Customers order directly from you. You keep 100% of revenue. No marketplace commissions.',
    alternates: {
          canonical: 'https://trayloophq.com/solutions/direct-ordering',
    },
    openGraph: {
          title: 'Direct Catering Orders for Restaurants - No Commissions | TrayLoop',
          description: 'Give your restaurant a branded direct catering ordering channel. You keep 100% of revenue.',
          url: 'https://trayloophq.com/solutions/direct-ordering',
          siteName: 'TrayLoop',
          type: 'website',
    },
};

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

/* ── Shared components ── */
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

function SectionHeading({
  children,
  light,
  style,
}: {
  children: React.ReactNode;
  light?: boolean;
  style?: CSSProperties;
}) {
  return (
    <h2
      style={{
        fontSize: 36,
        fontWeight: 700,
        color: light ? color.white : color.ink,
        lineHeight: 1.2,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

/* ── Page ── */
export default function DirectOrderingPage() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
            <SectionLabel>Direct Ordering</SectionLabel>
            <h1
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.12,
                marginBottom: 20,
              }}
            >
              Your customers order from you. Not a marketplace.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: color.muted,
                maxWidth: 540,
                marginBottom: 32,
              }}
            >
              Every order through a marketplace costs you 15-30% in commissions. TrayLoop
              gives you a branded storefront on your own URL so customers order directly
              from you. Your brand, your customers, your data &mdash; and you keep the
              revenue.
            </p>
            <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
          </div>
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=500&fit=crop"
              alt="Fresh food platter with vibrant ingredients"
              style={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 16,
              }}
            />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          STOREFRONT EXPERIENCE — 4 step walkthrough
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 56px' }}>
          <SectionLabel>Storefront Experience</SectionLabel>
          <SectionHeading>From landing to confirmed order in 4 steps</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Your customers get a premium ordering experience on your branded page.
          </p>
        </div>

        {/* Step 1 */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 64,
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 8,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 1
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Customer opens your storefront
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              Your branded ordering page lives on your own URL. Customers see your logo,
              your colors, and your menu. No marketplace branding, no competitor ads.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: color.ink }}>
                    Downtown Kitchen
                  </div>
                  <div style={{ fontSize: 13, color: color.muted }}>
                    Austin, TX
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color.teal,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: color.teal }}>
                    Accepting Orders
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                {[
                  { label: 'Min Order', value: '$200' },
                  { label: 'Lead Time', value: '48 hours' },
                  { label: 'Delivery', value: 'Free over $300' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: '1 1 100px',
                      padding: '10px 14px',
                      backgroundColor: color.cream,
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 64,
            flexDirection: 'row-reverse',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 8,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 2
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Browse and build their order
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              Customers browse your tiered packages, select headcount, and customize their
              order. Mobile-optimized for office managers ordering on the go.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: color.ink,
                  marginBottom: 16,
                }}
              >
                Catering Packages
              </div>
              {[
                {
                  name: 'Taco Platter',
                  price: '$10/pp',
                  min: 'Min 15 people',
                  desc: 'Choice of 3 proteins, rice, beans, toppings bar',
                },
                {
                  name: 'Executive Lunch Box',
                  price: '$14.95/pp',
                  min: 'Min 10 people',
                  desc: 'Sandwich, side, cookie, bottled water',
                },
                {
                  name: 'Premium Buffet',
                  price: '$29.95/pp',
                  min: 'Min 20 people',
                  desc: 'Full buffet with 3 entrees, 4 sides, dessert',
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  style={{
                    padding: '14px 16px',
                    marginBottom: 10,
                    borderRadius: 10,
                    backgroundColor: color.cream,
                    border: `1px solid ${color.creamDark}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      flexWrap: 'wrap',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: color.ink,
                      }}
                    >
                      {pkg.name}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: color.ink,
                      }}
                    >
                      {pkg.price}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: color.muted, marginBottom: 2 }}>
                    {pkg.desc}
                  </div>
                  <div style={{ fontSize: 11, color: color.muted }}>{pkg.min}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 64,
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 8,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 3
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Smart upsells appear
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              Contextual add-ons are suggested based on order size, cuisine type, and event
              type. Customers add with a single tap.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: color.teal,
                  marginBottom: 16,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Suggested Add-Ons
              </div>
              {[
                {
                  item: 'Dessert Tray',
                  price: '+$85',
                  reason: 'Popular with groups of 25+',
                },
                {
                  item: 'Coffee & Tea Service',
                  price: '+$120',
                  reason: 'Added by 62% of corporate orders',
                },
              ].map((addon) => (
                <div
                  key={addon.item}
                  style={{
                    padding: '12px 14px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: '#F0FBF5',
                    border: `1px solid ${color.teal}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>
                      {addon.item}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: color.teal }}>
                      {addon.price}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: color.muted }}>{addon.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4 */}
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
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 8,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 4
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Deposit collected, order confirmed
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              A deposit is collected via Stripe at checkout. The remaining balance is due at
              delivery. You are protected from no-shows and cancellations.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: color.ink,
                  marginBottom: 16,
                }}
              >
                Order Summary
              </div>
              {[
                { label: 'Premium Buffet (30 ppl)', value: '$898.50' },
                { label: 'Dessert Tray', value: '$85.00' },
                { label: 'Coffee & Tea Service', value: '$120.00' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: `1px solid ${color.creamDark}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: color.muted }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: color.ink }}>{row.value}</span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0 8px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.ink,
                  borderBottom: `1px solid ${color.creamDark}`,
                }}
              >
                <span>Subtotal</span>
                <span>$1,103.50</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 14,
                  color: color.orange,
                  fontWeight: 600,
                }}
              >
                <span>Deposit (25%)</span>
                <span>$275.88</span>
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
                <span>$827.62</span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: '14px 20px',
                  backgroundColor: '#635BFF',
                  color: color.white,
                  borderRadius: 10,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Pay $275.88 with Stripe
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          MARKETPLACE COMPARISON
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Why Direct</SectionLabel>
          <SectionHeading light>Marketplace vs. TrayLoop Direct</SectionHeading>
          <p style={{ fontSize: 16, color: '#C2B9AE', lineHeight: 1.6 }}>
            See the difference when you own the customer relationship.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Marketplace card */}
          <div
            style={{
              flex: '1 1 480px',
              maxWidth: 520,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 32,
              border: `2px solid ${color.red}`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: color.red,
                marginBottom: 24,
              }}
            >
              With Marketplace
            </div>
            {[
              { q: 'Who owns the customer?', a: 'The marketplace' },
              { q: 'Commission per order?', a: '15-30% per order' },
              { q: 'Brand visibility?', a: 'Listed alongside competitors' },
              { q: 'Customer data access?', a: 'No access to emails or history' },
              { q: 'Follow-up possible?', a: 'Not allowed by most platforms' },
              { q: 'Repeat orders?', a: 'Customer may pick a different restaurant' },
            ].map((row) => (
              <div
                key={row.q}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 13, color: color.muted, marginBottom: 4 }}>
                  {row.q}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: color.red }}>
                  {row.a}
                </div>
              </div>
            ))}
          </div>

          {/* TrayLoop Direct card */}
          <div
            style={{
              flex: '1 1 480px',
              maxWidth: 520,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 32,
              border: `2px solid ${color.teal}`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: color.teal,
                marginBottom: 24,
              }}
            >
              With TrayLoop Direct
            </div>
            {[
              { q: 'Who owns the customer?', a: 'You do. 100%.' },
              { q: 'Commission per order?', a: '$0 commission. Flat monthly fee.' },
              { q: 'Brand visibility?', a: 'Your brand only. No competitors.' },
              { q: 'Customer data access?', a: 'Full access: emails, history, preferences' },
              { q: 'Follow-up possible?', a: 'Automated re-engagement built in' },
              { q: 'Repeat orders?', a: 'Customer reorders directly from you' },
            ].map((row) => (
              <div
                key={row.q}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 13, color: color.muted, marginBottom: 4 }}>
                  {row.q}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: color.teal }}>
                  {row.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          LIVE STOREFRONT CTA
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            textAlign: 'center',
            padding: '48px 32px',
            backgroundColor: color.white,
            borderRadius: 20,
            border: `1px solid ${color.creamDark}`,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>&#127758;</div>
          <h3
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: color.ink,
              marginBottom: 12,
            }}
          >
            See a live storefront
          </h3>
          <p
            style={{
              fontSize: 16,
              color: color.muted,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Browse a real TrayLoop storefront to see the customer experience firsthand.
          </p>
          <a
            href="https://order.trayloophq.com/downtown-kitchen"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: color.orange,
              color: color.white,
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Visit order.trayloophq.com/downtown-kitchen &#8594;
          </a>
        </div>
      </Section>

    </main>
  );
}
