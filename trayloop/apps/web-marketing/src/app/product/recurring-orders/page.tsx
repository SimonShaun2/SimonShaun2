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

function BulletItem({ text }: { text: string }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 12,
        listStyle: 'none',
      }}
    >
      <TealDot />
      <span style={{ color: color.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

/* ── Page ── */
export default function RecurringOrdersPage() {
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
            <SectionLabel>Recurring Order Automation</SectionLabel>
            <h1
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.12,
                marginBottom: 20,
              }}
            >
              Turn one-time catering orders into a predictable revenue stream
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
              TrayLoop detects reorder patterns in your catering accounts and automatically
              reaches out at the perfect moment. Customers reorder in two clicks. You never
              chase a follow-up again.
            </p>
            <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
          </div>
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=500&fit=crop"
              alt="Restaurant service with elegant plating"
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
          THE PROBLEM
      ═══════════════════════════════════════════════ */}
      <Section bg={color.white}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>The Problem</SectionLabel>
          <SectionHeading>
            72% of catering customers never reorder without follow-up
          </SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Without a system to re-engage customers, most catering businesses lose the
            majority of their repeat revenue. Here is how the broken cycle looks:
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
              icon: '\uD83D\uDCE5',
              title: 'Order Comes In',
              description:
                'A new customer places their first catering order. Great start — but this is where most restaurants stop paying attention.',
              step: 1,
            },
            {
              icon: '\u2705',
              title: 'Order Fulfilled',
              description:
                'Food is prepared, delivered on time, and the customer is happy. The transaction is complete and the ticket closes.',
              step: 2,
            },
            {
              icon: '\uD83D\uDD07',
              title: 'Silence',
              description:
                'No follow-up, no reminder, no re-engagement. Days turn into weeks. The customer forgets about you entirely.',
              step: 3,
            },
            {
              icon: '\uD83D\uDCC9',
              title: 'Revenue Lost',
              description:
                'The customer reorders from a competitor or a marketplace. You have lost a potentially recurring account forever.',
              step: 4,
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                flex: '1 1 240px',
                maxWidth: 260,
                backgroundColor: color.cream,
                borderRadius: 14,
                padding: 28,
                position: 'relative',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: color.muted,
                  marginBottom: 12,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Step {card.step}
              </div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: color.ink,
                  marginBottom: 8,
                }}
              >
                {card.title}
              </div>
              <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.55, margin: 0 }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — 4 step workflow
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 56px' }}>
          <SectionLabel>How It Works</SectionLabel>
          <SectionHeading>Four steps from first order to recurring revenue</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            TrayLoop automates the entire reorder cycle so you never have to chase a
            follow-up manually again.
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
              Customer places order
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              A customer orders through your TrayLoop storefront. Their information,
              preferences, and order details are captured automatically — no manual data
              entry required.
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
                  color: color.ink,
                  marginBottom: 16,
                }}
              >
                Storefront Checkout
              </div>
              {[
                { label: 'Customer', value: 'Sarah Chen' },
                { label: 'Company', value: 'Horizon Technologies' },
                { label: 'Email', value: 'sarah@horizontech.com' },
                { label: 'Order', value: 'Executive Lunch Package' },
                { label: 'Headcount', value: '25 people' },
                { label: 'Total', value: '$725.00' },
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
                  marginTop: 16,
                  padding: '10px 20px',
                  backgroundColor: color.orange,
                  color: color.white,
                  borderRadius: 999,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Place Order
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
              AI learns their pattern
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              TrayLoop&#39;s AI analyzes order frequency, timing, and value across all your
              accounts. It detects recurring patterns and predicts when each customer is
              likely to reorder next.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: color.muted,
                  marginBottom: 16,
                }}
              >
                AI Pattern Detection
              </div>
              {[
                {
                  company: 'Horizon Tech',
                  pattern: 'Every 3 weeks',
                  status: 'Due in 4 days',
                  statusColor: color.teal,
                  dot: false,
                },
                {
                  company: 'Meridian Group',
                  pattern: 'Monthly',
                  status: 'Due in 12 days',
                  statusColor: color.teal,
                  dot: false,
                },
                {
                  company: 'Apex Financial',
                  pattern: 'Bi-weekly',
                  status: 'Overdue 3 days',
                  statusColor: color.red,
                  dot: true,
                },
              ].map((row) => (
                <div
                  key={row.company}
                  style={{
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: color.white,
                        marginBottom: 4,
                      }}
                    >
                      {row.company}
                    </div>
                    <div style={{ fontSize: 12, color: color.muted }}>
                      {row.pattern}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {row.dot && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: color.red,
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: row.statusColor,
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
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
              Outreach fires automatically
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              When a customer is due to reorder, TrayLoop sends a personalized email or SMS
              automatically. The message includes their past order details and a direct
              reorder link. You can review before sending or let it fly on autopilot.
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
                  fontSize: 11,
                  fontWeight: 600,
                  color: color.muted,
                  marginBottom: 4,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Email Preview
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: color.ink,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${color.creamDark}`,
                }}
              >
                Time to schedule your next team lunch?
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: color.ink,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Hi Sarah,
                <br />
                <br />
                It&#39;s been about 3 weeks since your last order with us. Based on your
                usual schedule, your team might be ready for another Executive Lunch Package
                for 25.
                <br />
                <br />
                Your last order is saved and ready to reorder with one click.
              </p>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(66,217,160,0.08)',
                  border: `1px solid ${color.teal}`,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: color.teal,
                    marginBottom: 6,
                    textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}
                >
                  AI-Generated Note
                </div>
                <div style={{ fontSize: 13, color: color.ink, lineHeight: 1.5 }}>
                  &quot;We noticed your team particularly enjoyed the grilled chicken wraps
                  last time. We have added a new Southwest variation this month that pairs
                  perfectly with your usual order.&quot;
                </div>
              </div>
              <div
                style={{
                  padding: '10px 20px',
                  backgroundColor: color.teal,
                  color: color.ink,
                  borderRadius: 999,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Reorder Now &#8594;
              </div>
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
              Customer reorders directly
            </h3>
            <p style={{ fontSize: 15, color: color.muted, lineHeight: 1.6 }}>
              The customer clicks the link, confirms their order, and you receive a new
              booking — zero commission, zero marketplace fees. Revenue flows straight to
              you.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: '#F0FBF5',
                borderRadius: 14,
                padding: 28,
                border: `2px solid ${color.teal}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: color.teal,
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                }}
              >
                Order Confirmed
              </div>
              <div
                style={{
                  fontSize: 40,
                  marginBottom: 8,
                }}
              >
                &#10003;
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: color.ink,
                  marginBottom: 4,
                }}
              >
                Reorder from Horizon Tech
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: color.ink,
                  marginBottom: 4,
                }}
              >
                $725
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: color.teal,
                  marginBottom: 12,
                }}
              >
                $0 commission
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 24px',
                  backgroundColor: color.teal,
                  color: color.ink,
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Confirmed
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          AUTOMATION RULE BUILDER
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <SectionLabel>Automation Rules</SectionLabel>
            <SectionHeading light>Set it up once</SectionHeading>
            <p
              style={{
                fontSize: 16,
                color: '#C2B9AE',
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Configure your re-engagement rules once and TrayLoop handles everything from
              there. Target specific segments, choose your channel, set timing preferences,
              and let automation do the heavy lifting.
            </p>
            <p style={{ fontSize: 14, color: color.muted, lineHeight: 1.6 }}>
              Rules can run on full autopilot or require your approval before each message
              goes out. Set throttle limits so you never over-contact a customer.
            </p>
          </div>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 24,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: color.white,
                  marginBottom: 20,
                }}
              >
                Rule Configuration
              </div>
              {[
                { label: 'Target segment', value: 'At-risk accounts' },
                { label: 'Channel', value: 'Email' },
                { label: 'Timing', value: '3 days before predicted reorder' },
                { label: 'Approval mode', value: 'Auto-send' },
                { label: 'Max targets', value: '50 per day' },
                { label: 'Throttle', value: '1 message per customer per 14 days' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    marginBottom: 6,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: color.muted }}>{row.label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: color.white,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          RESULTS
      ═══════════════════════════════════════════════ */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Results</SectionLabel>
          <SectionHeading>Numbers that speak for themselves</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Average results from TrayLoop restaurants using recurring order automation.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '$1,840/mo', label: 'Average revenue recovered per merchant' },
            { value: '3\u00d7', label: 'Increase in repeat orders' },
            { value: '72%', label: 'Reorder rate from automated outreach' },
            { value: '$0', label: 'Commissions paid on reorders' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: 28,
                backgroundColor: color.white,
                borderRadius: 14,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: color.teal,
                  marginBottom: 8,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 15, color: color.muted, lineHeight: 1.4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIAL
      ═══════════════════════════════════════════════ */}
      <Section bg={color.white}>
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            textAlign: 'center',
            padding: '48px 32px',
            backgroundColor: color.cream,
            borderRadius: 20,
            border: `1px solid ${color.creamDark}`,
          }}
        >
          <div style={{ fontSize: 48, color: color.orange, marginBottom: 16 }}>
            &ldquo;
          </div>
          <p
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: color.ink,
              lineHeight: 1.6,
              marginBottom: 24,
              fontStyle: 'italic',
            }}
          >
            We had 47 accounts that ordered once and disappeared. TrayLoop re-engaged 19 in
            the first month &mdash; $14,000 recovered.
          </p>
          <div style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>
            Marcus Rivera
          </div>
          <div style={{ fontSize: 13, color: color.muted }}>
            Owner, Riverside Catering Co.
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          WHAT'S INCLUDED
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>What&#39;s Included</SectionLabel>
          <SectionHeading>Everything you need to automate repeat revenue</SectionHeading>
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
              title: 'AI Pattern Detection',
              bullets: [
                'Learns reorder frequency from every account',
                'Predicts next order date with increasing accuracy',
                'Flags accounts that break their usual cadence',
              ],
            },
            {
              title: 'Automated Outreach',
              bullets: [
                'Email and SMS templates with smart personalization',
                'Auto-send or approval-required modes',
                'Throttle controls to prevent over-contacting',
              ],
            },
            {
              title: 'Customer Segmentation',
              bullets: [
                'Group accounts by frequency, value, or risk level',
                'Target specific segments with custom rules',
                'Automatic segment updates as behavior changes',
              ],
            },
            {
              title: 'Revenue Tracking',
              bullets: [
                'Dashboard showing recovered revenue per campaign',
                'Reorder rate and win-back metrics',
                'Month-over-month recurring revenue trends',
              ],
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
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
                  marginBottom: 16,
                }}
              >
                {card.title}
              </div>
              <ul style={{ padding: 0, margin: 0 }}>
                {card.bullets.map((b) => (
                  <BulletItem key={b} text={b} />
                ))}
              </ul>
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
            Stop losing repeat revenue to silence.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            Let TrayLoop follow up with every account, every time, at exactly the right
            moment.
          </p>
          <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
