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

/* ── Feature section layout ── */
function FeatureSection({
  number,
  title,
  subtitle,
  description,
  bullets,
  aiNote,
  visual,
  reverse = false,
  bg = color.cream,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  aiNote: string;
  visual: React.ReactNode;
  reverse?: boolean;
  bg?: string;
}) {
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
        {number}
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ fontSize: 18, color: color.muted, marginBottom: 20 }}>{subtitle}</p>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: color.muted, marginBottom: 24 }}>
        {description}
      </p>
      <ul style={{ padding: 0, marginBottom: 20 }}>
        {bullets.map((b) => (
          <BulletItem key={b} text={b} />
        ))}
      </ul>
      <div style={{ fontSize: 13, color: color.teal }}>
        {aiNote}
      </div>
    </div>
  );

  const visualBlock = <div style={{ flex: '1 1 440px', minWidth: 300 }}>{visual}</div>;

  return (
    <Section bg={bg}>
      <div
        style={{
          display: 'flex',
          gap: 48,
          flexWrap: 'wrap',
          alignItems: 'center',
          flexDirection: reverse ? 'row-reverse' : 'row',
        }}
      >
        {textBlock}
        {visualBlock}
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT PAGE
   ══════════════════════════════════════════════ */
export default function ProductPage() {
  const featureNames = [
    'Recurring Order Automation',
    'Merchant Self-Service Portal',
    'Smart Pricing',
    'Smart Upsell',
    'Capacity Management',
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
            The Product
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.15,
              marginBottom: 32,
            }}
          >
            Everything your catering program needs to grow revenue on autopilot.
          </h1>

          {/* Pill navigation */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {featureNames.map((name, i) => (
              <a
                key={name}
                href={`#feature-${i + 1}`}
                style={{
                  display: 'inline-block',
                  padding: '8px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 999,
                  backgroundColor: color.white,
                  color: color.ink,
                  border: `1px solid ${color.creamDark}`,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FEATURE 1: Recurring Order Automation ── */}
      <div id="feature-1">
        <FeatureSection
          number="01"
          title="Recurring Order Automation"
          subtitle="Reorders happen automatically. Revenue grows while you sleep."
          description="Most catering revenue is lost not because the food was bad — but because no one followed up. TrayLoop tracks every account's order history and automatically sends reorder reminders at the perfect time. Customers reorder in two clicks. You don't lift a finger."
          bullets={[
            'Automated reorder reminders based on each account\'s cadence',
            'One-click reorder from the customer\'s last order',
            'Smart scheduling — reminders arrive when customers are planning their next event',
            'Full order history and preferences saved per account',
          ]}
          aiNote="Assisted by AI: Predicts the optimal reorder window for each account based on past order frequency, day-of-week patterns, and seasonal trends."
          bg={color.white}
          visual={
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: color.muted, marginBottom: 16 }}>
                Reorder Timeline — Apex Financial
              </div>
              {[
                { date: 'Mar 7', event: 'Order placed — $1,240', dot: color.teal },
                { date: 'Mar 19', event: 'Reorder reminder sent', dot: color.orange },
                { date: 'Mar 21', event: 'Reorder placed — $1,240', dot: color.teal },
                { date: 'Apr 2', event: 'Reorder reminder sent', dot: color.orange },
                { date: 'Apr 3', event: 'Reorder placed — $1,380 (+upsell)', dot: color.teal },
              ].map((item) => (
                <div
                  key={item.date + item.event}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: 12, color: color.muted, width: 52, flexShrink: 0 }}>
                    {item.date}
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
                  <span style={{ fontSize: 14, color: color.white }}>{item.event}</span>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* ── MID CTA ── */}
      <Section bg={color.white} style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
          <PillButton text="Back to overview" href="/" variant="ghost" />
        </div>
      </Section>

      {/* ── FEATURE 2: Merchant Self-Service Portal ── */}
      <div id="feature-2">
        <FeatureSection
          number="02"
          title="Merchant Self-Service Portal"
          subtitle="Your customers order on their terms. You stay out of the inbox."
          description="Give every catering account their own branded portal. They browse your menu, customize orders, schedule deliveries, and reorder from past orders — all without calling, emailing, or waiting for a proposal. You get the order. They get the convenience."
          bullets={[
            'Branded ordering portal with your logo, colors, and menu',
            'Customer accounts with saved preferences and order history',
            'Self-service scheduling — customers pick their delivery date and time',
            'Real-time order tracking and confirmation emails',
          ]}
          aiNote="Assisted by AI: Suggests menu items and packages based on the customer's past orders and group size."
          bg={color.cream}
          reverse
          visual={
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
                Rosario&apos;s Kitchen — Catering Portal
              </div>
              {/* Nav mockup */}
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  marginBottom: 20,
                  borderBottom: `2px solid ${color.creamDark}`,
                }}
              >
                {['Dashboard', 'Menu', 'Orders', 'Accounts', 'Settings'].map((tab, i) => (
                  <div
                    key={tab}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? color.orange : color.muted,
                      borderBottom: i === 0 ? `2px solid ${color.orange}` : '2px solid transparent',
                      marginBottom: -2,
                    }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                {[
                  { label: 'This Month', value: '$8,420' },
                  { label: 'Pending Orders', value: '3' },
                  { label: 'Active Accounts', value: '18' },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      backgroundColor: color.cream,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: 11, color: color.muted }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color.ink, marginTop: 4 }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* ── FEATURE 3: Smart Pricing ── */}
      <div id="feature-3">
        <FeatureSection
          number="03"
          title="Smart Pricing"
          subtitle="Build packages that increase average order value — automatically."
          description="Stop quoting every order by hand. Smart Pricing lets you create tiered packages, group bundles, and per-person pricing that adjusts based on headcount. Customers see clear options. You make more per order."
          bullets={[
            'Tiered per-person pricing that scales with group size',
            'Pre-built packages (Standard, Premium, Executive) for fast selection',
            'Custom add-ons and upgrades surfaced at checkout',
            'Minimum order thresholds and delivery fees built in',
          ]}
          aiNote="Coming soon: AI-assisted pricing recommendations based on your order history, margins, and competitive data."
          bg={color.creamDark}
          visual={
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
                Package Builder
              </div>
              {[
                {
                  name: 'Standard Lunch',
                  per: '$18/person',
                  desc: 'Wraps, salads, cookies, drinks',
                  popular: false,
                },
                {
                  name: 'Premium Lunch',
                  per: '$26/person',
                  desc: 'Hot entrees, two sides, dessert platter, drinks',
                  popular: true,
                },
                {
                  name: 'Executive Package',
                  per: '$38/person',
                  desc: 'Chef\'s selection, premium sides, dessert bar, sparkling water',
                  popular: false,
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: pkg.popular ? '#FFF7F0' : color.cream,
                    border: pkg.popular ? `1.5px solid ${color.orange}` : `1px solid ${color.creamDark}`,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: color.ink, fontSize: 15 }}>
                        {pkg.name}
                      </span>
                      {pkg.popular && (
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
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>{pkg.desc}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: color.ink, fontSize: 15, whiteSpace: 'nowrap' }}>
                    {pkg.per}
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* ── FEATURE 4: Smart Upsell ── */}
      <div id="feature-4">
        <FeatureSection
          number="04"
          title="Smart Upsell"
          subtitle="Add revenue to every order without adding work."
          description="TrayLoop surfaces the right add-ons at the right moment during checkout. Beverage packages, dessert platters, premium utensil kits — suggested based on order size and customer history. Customers add with one click. Your average order value goes up."
          bullets={[
            'Contextual upsell suggestions at checkout based on order contents',
            'One-click add-ons — no phone calls, no manual quoting',
            'Track upsell acceptance rates and revenue impact per item',
            'Configure which items appear as upsells and set display rules',
          ]}
          aiNote="Assisted by AI: Recommends the highest-converting add-ons for each order based on customer history, order size, and time of day."
          bg={color.cream}
          reverse
          visual={
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 4 }}>
                Checkout — Suggested Add-ons
              </div>
              <div style={{ fontSize: 12, color: color.muted, marginBottom: 16 }}>
                Based on order for 25 people
              </div>
              {[
                {
                  item: 'Beverage Package',
                  price: '+$85',
                  rate: '68% acceptance',
                  checked: true,
                },
                {
                  item: 'Dessert Platter',
                  price: '+$65',
                  rate: '54% acceptance',
                  checked: true,
                },
                {
                  item: 'Premium Utensil Kit',
                  price: '+$25',
                  rate: '42% acceptance',
                  checked: false,
                },
                {
                  item: 'Sparkling Water Upgrade',
                  price: '+$35',
                  rate: '31% acceptance',
                  checked: false,
                },
              ].map((u) => (
                <div
                  key={u.item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    marginBottom: 6,
                    borderRadius: 10,
                    backgroundColor: u.checked ? '#F0FBF5' : color.cream,
                    border: u.checked
                      ? `1.5px solid ${color.teal}`
                      : `1px solid ${color.creamDark}`,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: u.checked ? color.teal : 'transparent',
                      border: u.checked ? 'none' : `1.5px solid ${color.muted}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color.white,
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {u.checked ? '✓' : ''}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500, color: color.ink, fontSize: 14 }}>
                    {u.item}
                  </span>
                  <span style={{ fontSize: 12, color: color.muted }}>{u.rate}</span>
                  <span style={{ fontWeight: 700, color: color.teal, fontSize: 14 }}>{u.price}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 14,
                  padding: '12px 14px',
                  backgroundColor: '#F0FBF5',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: color.ink }}>Upsell total</span>
                <span style={{ color: color.teal }}>+$150</span>
              </div>
            </div>
          }
        />
      </div>

      {/* ── MID CTA ── */}
      <Section bg={color.cream} style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
          <PillButton text="Back to overview" href="/" variant="ghost" />
        </div>
      </Section>

      {/* ── FEATURE 5: Capacity Management ── */}
      <div id="feature-5">
        <FeatureSection
          number="05"
          title="Capacity Management"
          subtitle="Never overbook. Never turn away revenue you could handle."
          description="Set daily catering limits per location so you never take on more than your kitchen can deliver. TrayLoop automatically blocks new orders when you're at capacity and opens slots when you're free. No more frantic mornings. No more missed opportunities."
          bullets={[
            'Set maximum daily catering orders per location',
            'Automatic slot blocking when capacity is reached',
            'Blackout dates for holidays, private events, or kitchen maintenance',
            'Multi-location support with independent capacity settings',
          ]}
          aiNote="Coming soon: AI-assisted capacity optimization that recommends ideal limits based on your kitchen's throughput and historical order patterns."
          bg={color.white}
          visual={
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

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: color.muted, marginBottom: 10 }}>
                  This week&apos;s capacity
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                  const fills = [5, 8, 3, 7, 2];
                  const fill = fills[i];
                  const max = 8;
                  const pct = (fill / max) * 100;
                  const atCap = fill >= max;
                  return (
                    <div
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, color: color.muted, width: 32 }}>{day}</span>
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          backgroundColor: color.creamDark,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: atCap ? color.red : color.teal,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: atCap ? color.red : color.ink,
                          width: 36,
                          textAlign: 'right',
                        }}
                      >
                        {fill}/{max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />
      </div>

      {/* ── CLOSING CTA ── */}
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
            Ready to take control of your catering revenue?
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 8 }}>
            $49/month + 5% platform fee. No contracts. No commissions. Cancel anytime.
          </p>
          <p style={{ fontSize: 14, color: color.muted, marginBottom: 32 }}>
            We handle the full setup — your portal is live within 48 hours.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton text="Sign Up →" href="https://dashboard.trayloophq.com/register" variant="primary" />
            <PillButton text="See how it works →" href="/how-it-works" variant="ghost" />
          </div>
        </div>
      </Section>
    </main>
  );
}
