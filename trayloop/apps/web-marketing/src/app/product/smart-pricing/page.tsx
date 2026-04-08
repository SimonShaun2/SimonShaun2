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

function GreenTip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: '12px 16px',
        borderRadius: 10,
        backgroundColor: 'rgba(66,217,160,0.08)',
        border: `1px solid ${color.teal}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: color.teal,
          marginBottom: 4,
          textTransform: 'uppercase' as const,
          letterSpacing: 1,
        }}
      >
        Tip
      </div>
      <div style={{ fontSize: 13, color: color.ink, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/* ── Page ── */
export default function SmartPricingPage() {
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
            <SectionLabel>Smart Pricing</SectionLabel>
            <h1
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.12,
                marginBottom: 20,
              }}
            >
              Price catering based on what actually drives margin
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
              Build tiered packages, set per-head pricing, enforce minimums, and collect
              deposits automatically. Customers see clear options. You protect your margins
              on every order.
            </p>
            <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
          </div>
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
            <img
              src="https://images.unsplash.com/photo-1555244162-803834f70033?w=900&h=500&fit=crop"
              alt="Catering buffet spread with variety of dishes"
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
          THREE PRICING MODELS
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Pricing Models</SectionLabel>
          <SectionHeading>Three models. One goal: protect your margins.</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Choose the pricing model that fits each package, or combine them for maximum
            flexibility.
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
          {/* Per-Head */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>&#128101;</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 8,
              }}
            >
              Per-Head Pricing
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Charge a flat rate per person. Price scales automatically with headcount.
              Ideal for lunch packages and buffet-style catering where portions are
              standardized.
            </p>
            <div
              style={{
                backgroundColor: color.cream,
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: color.muted,
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Example
              </div>
              <div style={{ fontSize: 14, color: color.ink, lineHeight: 1.6 }}>
                Executive Lunch: <strong>$28/head</strong>
                <br />
                25 people = <strong>$700</strong>
                <br />
                Minimum: 10 people ($280)
              </div>
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>
              <strong style={{ color: color.ink }}>Best for:</strong> Corporate lunches,
              boxed meals, buffet packages
            </div>
          </div>

          {/* Flat-Rate */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>&#128176;</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 8,
              }}
            >
              Flat-Rate Pricing
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Set a single price for the entire package regardless of headcount. Best for
              platters, trays, and fixed-portion items where cost doesn&#39;t scale linearly
              with guests.
            </p>
            <div
              style={{
                backgroundColor: color.cream,
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: color.muted,
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Example
              </div>
              <div style={{ fontSize: 14, color: color.ink, lineHeight: 1.6 }}>
                Taco Platter (serves 12-15): <strong>$120</strong>
                <br />
                Dessert Tray (serves 20): <strong>$85</strong>
                <br />
                No headcount calculation needed
              </div>
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>
              <strong style={{ color: color.ink }}>Best for:</strong> Platters, appetizer
              trays, dessert packages
            </div>
          </div>

          {/* Hybrid */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `2px solid ${color.orange}`,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>&#9878;&#65039;</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                Hybrid Pricing
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: color.orange,
                  backgroundColor: '#FFF0E6',
                  padding: '2px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase' as const,
                }}
              >
                Popular
              </span>
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Combine a base fee with per-head pricing. Covers your fixed costs (setup,
              delivery, equipment) while scaling with party size. The most flexible model
              for complex catering.
            </p>
            <div
              style={{
                backgroundColor: color.cream,
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: color.muted,
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Example
              </div>
              <div style={{ fontSize: 14, color: color.ink, lineHeight: 1.6 }}>
                Base fee: <strong>$150</strong> (setup + delivery)
                <br />
                Per head: <strong>$22/person</strong>
                <br />
                30 people = $150 + $660 = <strong>$810</strong>
              </div>
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>
              <strong style={{ color: color.ink }}>Best for:</strong> Full-service events,
              multi-course meals, on-site catering
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          PACKAGE BUILDER
      ═══════════════════════════════════════════════ */}
      <Section bg={color.white}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <SectionLabel>Package Builder</SectionLabel>
            <SectionHeading style={{ fontSize: 30 }}>
              Build packages customers actually want to order
            </SectionHeading>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Create tiered catering packages with drag-and-drop simplicity. Set pricing,
              descriptions, minimum headcounts, and thumbnails for each package. Customers
              browse a clean menu and order in minutes.
            </p>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              Good/Better/Best tiering naturally guides customers toward higher-value
              packages without feeling pushy. Most merchants see a 22% increase in average
              order value after switching to tiered packages.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.cream,
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
                  marginBottom: 20,
                }}
              >
                Your Packages
              </div>

              {[
                {
                  name: 'Taco Platter',
                  price: '$10/pp',
                  min: 'Min 15 people',
                  img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&h=80&fit=crop',
                  active: false,
                },
                {
                  name: 'Basic Lunch Box',
                  price: '$14.95/pp',
                  min: 'Min 10 people',
                  img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
                  active: true,
                },
                {
                  name: 'Premium Buffet',
                  price: '$29.95/pp',
                  min: 'Min 20 people',
                  img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=80&h=80&fit=crop',
                  active: false,
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    marginBottom: 10,
                    borderRadius: 10,
                    backgroundColor: color.white,
                    border: pkg.active
                      ? `2px solid ${color.orange}`
                      : `1px solid ${color.creamDark}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: color.muted,
                      cursor: 'grab',
                      flexShrink: 0,
                    }}
                  >
                    &#9776;
                  </div>
                  <img
                    src={pkg.img}
                    alt={pkg.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: color.ink,
                        marginBottom: 2,
                      }}
                    >
                      {pkg.name}
                    </div>
                    <div style={{ fontSize: 12, color: color.muted }}>{pkg.min}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: color.ink,
                      flexShrink: 0,
                    }}
                  >
                    {pkg.price}
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 12,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: `1.5px dashed ${color.muted}`,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: color.muted,
                  cursor: 'pointer',
                }}
              >
                + Add Package
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          ENFORCED AT CHECKOUT
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Checkout Enforcement</SectionLabel>
          <SectionHeading light>Enforced at checkout. No exceptions.</SectionHeading>
          <p style={{ fontSize: 16, color: '#C2B9AE', lineHeight: 1.6 }}>
            Set your rules once and TrayLoop enforces them on every order. No more
            underpriced orders slipping through.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {[
            {
              icon: '\uD83D\uDCB0',
              title: 'Minimum Order Amount',
              description:
                'Set a minimum dollar amount per order. Customers cannot check out below your threshold. Protects you from small, unprofitable orders that cost more to fulfill than they earn.',
            },
            {
              icon: '\uD83C\uDFE6',
              title: 'Deposit Collection',
              description:
                'Require a percentage deposit at checkout (25%, 50%, or custom). Deposits are collected via Stripe and deducted from the final invoice. No more no-shows or last-minute cancellations.',
            },
            {
              icon: '\u23F0',
              title: 'Lead Time Requirements',
              description:
                'Set minimum advance ordering time (24hr, 48hr, 72hr, or custom). Prevents last-minute orders that strain your kitchen and compromise food quality.',
            },
            {
              icon: '\uD83D\uDC65',
              title: 'Headcount Limits',
              description:
                'Set minimum and maximum headcount per package. Ensures orders are sized appropriately for your kitchen capacity and pricing model.',
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 28,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 10,
                }}
              >
                {card.title}
              </div>
              <p style={{ fontSize: 14, color: '#C2B9AE', lineHeight: 1.6, margin: 0 }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          PRICING STRATEGY GUIDANCE
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Strategy Guidance</SectionLabel>
          <SectionHeading>Pricing strategies that work for catering</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Built-in guidance based on data from hundreds of catering operations.
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
          {/* Good/Better/Best */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Good / Better / Best
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6 }}>
              Offer three tiers at different price points. The middle tier becomes the
              anchor and drives the majority of orders. The premium tier makes the middle
              feel like a deal while capturing customers who want the best.
            </p>
            <GreenTip>
              Merchants using 3-tier pricing see a <strong>22% higher AOV</strong> compared
              to single-package menus.
            </GreenTip>
          </div>

          {/* Add-On Revenue */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Add-On Revenue
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6 }}>
              Price your base packages competitively and build margin into add-ons.
              Beverages, desserts, premium utensils, and setup fees are high-margin items
              that customers expect to pay extra for. Smart Upsell suggests them
              automatically at checkout.
            </p>
            <GreenTip>
              Add-ons contribute <strong>$85 in additional revenue</strong> per order on
              average across TrayLoop merchants.
            </GreenTip>
          </div>

          {/* Event-Based Pricing */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 12,
              }}
            >
              Event-Based Pricing
            </div>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6 }}>
              Adjust pricing based on event type and complexity. Board meetings and
              executive events command premium pricing. Team lunches and all-hands meetings
              work best with competitive per-head rates that drive volume.
            </p>
            <GreenTip>
              Executive event packages are priced <strong>40-60% higher</strong> than
              standard lunch packages with no drop in conversion.
            </GreenTip>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════ */}
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
            Stop guessing. Start pricing for profit.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how Smart Pricing protects your margins on every catering order.
          </p>
          <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
