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

/* ── Page ── */
export default function SmartUpsellPage() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <SectionLabel>Smart Upsell</SectionLabel>
          <h1
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.12,
              marginBottom: 20,
            }}
          >
            Every order gets bigger with the right suggestions
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: color.muted,
              maxWidth: 600,
              margin: '0 auto 40px',
            }}
          >
            TrayLoop surfaces contextual add-ons at checkout based on order size, customer
            history, and headcount. Customers add with one click. Your average order value
            climbs.
          </p>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 24,
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          {[
            { value: '+15%', label: 'Avg order increase' },
            { value: '$85', label: 'Avg upsell value' },
            { value: '38%', label: 'Attach rate' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: '1 1 180px',
                textAlign: 'center',
                padding: '20px 16px',
                backgroundColor: color.white,
                borderRadius: 12,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: color.teal,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: color.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          CHECKOUT FLOW
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Checkout Flow</SectionLabel>
          <SectionHeading>How upsells appear at checkout</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Seamlessly integrated into the ordering experience. No pop-ups, no friction.
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
          {/* Step 1: Customer builds order */}
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
                fontSize: 11,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 12,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 1
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 16,
              }}
            >
              Customer builds order
            </div>
            <div
              style={{
                backgroundColor: color.cream,
                borderRadius: 10,
                padding: 16,
              }}
            >
              {[
                { item: 'Executive Lunch Package', qty: '30 ppl', price: '$840' },
                { item: 'Premium Utensil Kit', qty: '1', price: '$45' },
              ].map((row) => (
                <div
                  key={row.item}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: `1px solid ${color.creamDark}`,
                    fontSize: 13,
                    flexWrap: 'wrap',
                    gap: 4,
                  }}
                >
                  <span style={{ color: color.ink, fontWeight: 500 }}>{row.item}</span>
                  <span style={{ color: color.muted }}>{row.qty}</span>
                  <span style={{ fontWeight: 600, color: color.ink }}>{row.price}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                <span>Subtotal</span>
                <span>$885</span>
              </div>
            </div>
          </div>

          {/* Step 2: Suggestions appear */}
          <div
            style={{
              flex: '1 1 320px',
              maxWidth: 360,
              backgroundColor: color.white,
              borderRadius: 14,
              padding: 28,
              border: `2px solid ${color.teal}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 12,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 2
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 16,
              }}
            >
              Suggestions appear
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
              {
                item: 'Sparkling Water Upgrade',
                price: '+$65',
                reason: 'Pairs well with Executive Lunch',
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

          {/* Step 3: Order total increases */}
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
                fontSize: 11,
                fontWeight: 700,
                color: color.orange,
                marginBottom: 12,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Step 3
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: color.ink,
                marginBottom: 16,
              }}
            >
              Order total increases
            </div>
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  color: color.muted,
                  marginBottom: 8,
                }}
              >
                <span>Original subtotal</span>
                <span>$885</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  color: color.teal,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                <span>Add-ons</span>
                <span>+$270</span>
              </div>
              <div
                style={{
                  borderTop: `2px solid ${color.ink}`,
                  paddingTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 800,
                  color: color.ink,
                }}
              >
                <span>New total</span>
                <span>$1,155</span>
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: color.teal,
              }}
            >
              +$270 from upsells (+30%)
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          UPSELL BY CUISINE
      ═══════════════════════════════════════════════ */}
      <Section bg={color.white}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>By Cuisine</SectionLabel>
          <SectionHeading>Upsells tailored to your cuisine type</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Different cuisines have different high-margin add-ons. TrayLoop knows what works
            for each.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}
        >
          {[
            {
              cuisine: 'Italian',
              headerColor: '#C41E3A',
              packages: ['Pasta Bar', 'Antipasto Platter', 'Family-Style Feast'],
              upsells: ['Tiramisu Tray (+$65)', 'Garlic Bread Add-On (+$28)', 'Italian Soda Station (+$45)'],
              tip: 'Dessert trays convert at 52% with Italian orders.',
            },
            {
              cuisine: 'Mexican',
              headerColor: '#D97706',
              packages: ['Taco Bar', 'Burrito Bowl Station', 'Fiesta Platter'],
              upsells: ['Guac & Chips (+$35)', 'Churro Platter (+$40)', 'Horchata Drinks (+$30)'],
              tip: 'Guac & chips is the #1 upsell for Mexican catering.',
            },
            {
              cuisine: 'BBQ',
              headerColor: '#92400E',
              packages: ['Smokehouse Platter', 'BBQ Sandwich Box', 'Pitmaster Buffet'],
              upsells: ['Mac & Cheese Tray (+$55)', 'Cornbread Basket (+$22)', 'Sweet Tea Station (+$35)'],
              tip: 'Side dishes convert at 44% with BBQ orders over $500.',
            },
            {
              cuisine: 'Corporate',
              headerColor: color.ink,
              packages: ['Executive Lunch', 'Meeting Box', 'All-Hands Buffet'],
              upsells: ['Coffee & Tea Service (+$120)', 'Dessert Assortment (+$85)', 'Premium Utensils (+$45)'],
              tip: 'Coffee service is added to 62% of corporate orders.',
            },
          ].map((item) => (
            <div
              key={item.cuisine}
              style={{
                backgroundColor: color.cream,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  backgroundColor: item.headerColor,
                  padding: '14px 20px',
                  color: color.white,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {item.cuisine}
              </div>
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: color.muted,
                    marginBottom: 8,
                    textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}
                >
                  Popular Packages
                </div>
                <div style={{ marginBottom: 16 }}>
                  {item.packages.map((p) => (
                    <div
                      key={p}
                      style={{
                        fontSize: 13,
                        color: color.ink,
                        padding: '4px 0',
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: color.muted,
                    marginBottom: 8,
                    textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}
                >
                  Top Upsells
                </div>
                <div style={{ marginBottom: 16 }}>
                  {item.upsells.map((u) => (
                    <div
                      key={u}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '4px 0',
                        fontSize: 13,
                        color: color.ink,
                      }}
                    >
                      <TealDot />
                      <span>{u}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(66,217,160,0.08)',
                    border: `1px solid ${color.teal}`,
                    fontSize: 12,
                    color: color.ink,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: color.teal }}>Tip:</strong> {item.tip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          UPSELL BY EVENT TYPE
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>By Event Type</SectionLabel>
          <SectionHeading light>Different events, different upsell opportunities</SectionHeading>
          <p style={{ fontSize: 16, color: '#C2B9AE', lineHeight: 1.6 }}>
            TrayLoop adjusts suggestions based on the type of event being catered.
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
          {[
            {
              event: 'Corporate Lunch',
              headcount: '15-30 people',
              avgOrder: '$420',
              upsells: ['Dessert Tray', 'Beverage Package', 'Premium Utensils'],
              avgUpsell: '$85',
              attachRate: '38%',
            },
            {
              event: 'Board Meeting',
              headcount: '8-15 people',
              avgOrder: '$680',
              upsells: ['Coffee & Tea Service', 'Breakfast Pastries', 'Artisan Sandwich Upgrade'],
              avgUpsell: '$145',
              attachRate: '52%',
            },
            {
              event: 'Company Event',
              headcount: '50-200 people',
              avgOrder: '$2,400',
              upsells: ['Bar Service', 'Dessert Station', 'Late-Night Snack Add-On'],
              avgUpsell: '$380',
              attachRate: '61%',
            },
          ].map((item) => (
            <div
              key={item.event}
              style={{
                flex: '1 1 320px',
                maxWidth: 360,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 28,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 16,
                }}
              >
                {item.event}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>
                    Headcount
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: color.white }}>
                    {item.headcount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>
                    Avg Order
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: color.white }}>
                    {item.avgOrder}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: color.muted,
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Top Upsells
              </div>
              {item.upsells.map((u) => (
                <div
                  key={u}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 0',
                    fontSize: 13,
                    color: color.white,
                  }}
                >
                  <TealDot />
                  <span>{u}</span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>
                    Avg Upsell
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: color.teal }}>
                    {item.avgUpsell}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>
                    Attach Rate
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: color.teal }}>
                    {item.attachRate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          ANALYTICS MOCKUP
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Analytics</SectionLabel>
          <SectionHeading>Track every upsell dollar</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            See which add-ons perform best and optimize your menu accordingly.
          </p>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: 'Total Upsell Revenue', value: '$4,280', period: 'This month' },
            { label: 'Avg Upsell per Order', value: '$85', period: 'This month' },
            { label: 'Attach Rate', value: '38%', period: '+4% vs last month' },
            { label: 'Top Performer', value: 'Coffee Service', period: '$1,440 revenue' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                backgroundColor: color.white,
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 12, color: color.muted, marginBottom: 4 }}>
                {kpi.label}
              </div>
              <div
                style={{ fontSize: 24, fontWeight: 800, color: color.ink, marginBottom: 4 }}
              >
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, color: color.teal, fontWeight: 600 }}>
                {kpi.period}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Table */}
        <div
          style={{
            backgroundColor: color.white,
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${color.creamDark}`,
          }}
        >
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${color.creamDark}` }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: color.ink }}>
              Add-On Performance
            </div>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'flex',
              padding: '12px 24px',
              borderBottom: `1px solid ${color.creamDark}`,
              backgroundColor: color.cream,
              fontSize: 12,
              fontWeight: 600,
              color: color.muted,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.5,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ flex: '2 1 140px' }}>Add-On</span>
            <span style={{ flex: '1 1 60px', textAlign: 'right' }}>Shown</span>
            <span style={{ flex: '1 1 60px', textAlign: 'right' }}>Added</span>
            <span style={{ flex: '1 1 80px', textAlign: 'right' }}>Attach Rate</span>
            <span style={{ flex: '1 1 80px', textAlign: 'right' }}>Revenue</span>
          </div>

          {/* Table rows */}
          {[
            {
              name: 'Coffee & Tea Service',
              shown: 248,
              added: 154,
              rate: '62%',
              revenue: '$1,440',
            },
            {
              name: 'Dessert Tray',
              shown: 312,
              added: 162,
              rate: '52%',
              revenue: '$1,215',
            },
            {
              name: 'Premium Utensil Kit',
              shown: 420,
              added: 143,
              rate: '34%',
              revenue: '$858',
            },
            {
              name: 'Sparkling Water Upgrade',
              shown: 380,
              added: 95,
              rate: '25%',
              revenue: '$767',
            },
          ].map((row) => (
            <div
              key={row.name}
              style={{
                display: 'flex',
                padding: '14px 24px',
                borderBottom: `1px solid ${color.creamDark}`,
                fontSize: 14,
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ flex: '2 1 140px', fontWeight: 500, color: color.ink }}>
                {row.name}
              </span>
              <span style={{ flex: '1 1 60px', textAlign: 'right', color: color.muted }}>
                {row.shown}
              </span>
              <span style={{ flex: '1 1 60px', textAlign: 'right', color: color.muted }}>
                {row.added}
              </span>
              <span
                style={{
                  flex: '1 1 80px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: color.teal,
                }}
              >
                {row.rate}
              </span>
              <span
                style={{
                  flex: '1 1 80px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                {row.revenue}
              </span>
            </div>
          ))}
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
            Make every order worth more.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See how Smart Upsell adds revenue to every checkout without adding work.
          </p>
          <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
