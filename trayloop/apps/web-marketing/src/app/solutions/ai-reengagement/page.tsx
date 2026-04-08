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
export default function AiReengagementPage() {
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
            <SectionLabel>AI Re-engagement</SectionLabel>
            <h1
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.12,
                marginBottom: 20,
              }}
            >
              Bring back customers before they disappear
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
              Most restaurants don&#39;t realize a customer has left until it&#39;s too late.
              TrayLoop&#39;s AI detects at-risk accounts based on ordering patterns and
              generates personalized outreach to bring them back &mdash; before they find
              another caterer.
            </p>
            <PillButton text="Book a free Demo &#8594;" href="/demo" variant="primary" />
          </div>
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: '48px 40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: color.orange,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                72%
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: color.white,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                of catering customers never reorder
              </div>
              <div style={{ fontSize: 14, color: color.muted }}>
                without proactive follow-up
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          WHY CUSTOMERS DISAPPEAR
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>The Problem</SectionLabel>
          <SectionHeading light>Why customers disappear</SectionHeading>
          <p style={{ fontSize: 16, color: '#C2B9AE', lineHeight: 1.6 }}>
            Understanding why customers leave is the first step to bringing them back.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            marginBottom: 32,
          }}
        >
          {[
            {
              pct: '45%',
              reason: 'Simply forgot about you',
              description:
                'Life gets busy. Office managers juggle dozens of vendors. Without a reminder, your restaurant falls off their radar within weeks.',
            },
            {
              pct: '28%',
              reason: 'A competitor reached out first',
              description:
                'While you waited, another caterer sent a follow-up email or showed up in a marketplace search. First mover advantage is real.',
            },
            {
              pct: '18%',
              reason: 'No easy way to reorder',
              description:
                'Digging through old emails for a phone number or navigating a clunky website is enough friction to make customers try somewhere new.',
            },
            {
              pct: '9%',
              reason: 'Actual dissatisfaction',
              description:
                'Only a small fraction of churned customers were actually unhappy. The vast majority left for preventable reasons.',
            },
          ].map((card) => (
            <div
              key={card.reason}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 28,
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: color.orange,
                  marginBottom: 8,
                }}
              >
                {card.pct}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 10,
                }}
              >
                {card.reason}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: '#C2B9AE',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            maxWidth: 500,
            margin: '0 auto',
            textAlign: 'center',
            padding: '16px 24px',
            borderRadius: 10,
            backgroundColor: 'rgba(66,217,160,0.1)',
            border: `1px solid ${color.teal}`,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: color.teal }}>
            91% of catering churn is preventable
          </span>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          CUSTOMER LIFECYCLE
      ═══════════════════════════════════════════════ */}
      <Section bg={color.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Customer Lifecycle</SectionLabel>
          <SectionHeading>From first order to growing account</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            TrayLoop manages the entire customer lifecycle automatically.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 0,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {[
            { step: '1', title: 'First Order', desc: 'Customer places their first catering order through your storefront.' },
            { step: '2', title: 'Pattern Detected', desc: 'AI analyzes order timing and predicts their next reorder window.' },
            { step: '3', title: 'Outreach Sent', desc: 'Personalized email or SMS fires automatically at the right moment.' },
            { step: '4', title: 'Reorder Placed', desc: 'Customer reorders directly from you with one click. Zero commission.' },
            { step: '5', title: 'Account Grows', desc: 'Order value increases over time with smart upsells and relationship building.' },
          ].map((item, i) => (
            <div
              key={item.step}
              style={{
                flex: '1 1 200px',
                maxWidth: 220,
                position: 'relative',
                textAlign: 'center',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: i === 4 ? color.teal : color.orange,
                  color: color.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  margin: '0 auto 12px',
                }}
              >
                {item.step}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.ink,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: color.muted,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          SEGMENTATION DEEP DIVE
      ═══════════════════════════════════════════════ */}
      <Section bg={color.white}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Segmentation</SectionLabel>
          <SectionHeading>AI-powered customer segments</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Every customer is automatically classified into a segment based on their
            ordering behavior. Each segment gets a different re-engagement strategy.
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
              name: 'Frequent',
              pct: '35%',
              barColor: color.teal,
              description:
                'Customers who order regularly and on schedule. These are your most valuable accounts. The goal is to keep them ordering and increase their average order value over time.',
              action:
                'Send order reminders 2-3 days before their predicted reorder date. Suggest upsells based on past orders. Offer loyalty pricing or early access to new menu items to reinforce the relationship.',
              example: {
                name: 'Sarah Chen',
                company: 'Horizon Technologies',
                detail: 'Orders every 3 weeks, avg $725',
              },
            },
            {
              name: 'At-Risk',
              pct: '40%',
              barColor: color.orange,
              description:
                'Customers who have broken their usual ordering pattern. They ordered regularly but have gone quiet. This is the critical window where intervention matters most.',
              action:
                'Send a personalized re-engagement email within 5 days of a missed expected order. Include their last order details for easy reordering. If no response, follow up with a different channel (SMS) after 3 days.',
              example: {
                name: 'David Park',
                company: 'Meridian Group',
                detail: 'Usually monthly, last order 6 weeks ago',
              },
            },
            {
              name: 'Dormant',
              pct: '25%',
              barColor: color.red,
              description:
                'Customers who have not ordered in 60+ days and show no signs of returning. These accounts need a stronger incentive to re-engage but still represent significant recovery potential.',
              action:
                'Send a win-back campaign with a compelling offer or new menu highlight. Keep the message short and personal. If no response after 2 attempts, move to a quarterly check-in cadence to stay top of mind.',
              example: {
                name: 'Lisa Martinez',
                company: 'Apex Financial',
                detail: 'Last order 90 days ago, was bi-weekly',
              },
            },
          ].map((seg) => (
            <div
              key={seg.name}
              style={{
                flex: '1 1 320px',
                maxWidth: 360,
                backgroundColor: color.cream,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              {/* Colored top bar */}
              <div style={{ height: 6, backgroundColor: seg.barColor }} />

              <div style={{ padding: 28 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: color.ink,
                    }}
                  >
                    {seg.name}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: seg.barColor,
                    }}
                  >
                    {seg.pct}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: color.muted,
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {seg.description}
                </p>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: color.ink,
                    marginBottom: 8,
                    textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}
                >
                  Recommended Action
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: color.ink,
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {seg.action}
                </p>

                <div
                  style={{
                    backgroundColor: color.white,
                    borderRadius: 10,
                    padding: 14,
                    border: `1px solid ${color.creamDark}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: color.muted,
                      marginBottom: 6,
                      textTransform: 'uppercase' as const,
                      letterSpacing: 1,
                    }}
                  >
                    Example Customer
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: color.ink,
                      marginBottom: 2,
                    }}
                  >
                    {seg.example.name}
                  </div>
                  <div style={{ fontSize: 12, color: color.muted }}>
                    {seg.example.company}
                  </div>
                  <div style={{ fontSize: 12, color: color.muted }}>
                    {seg.example.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          CAMPAIGN WALKTHROUGH
      ═══════════════════════════════════════════════ */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Campaign Walkthrough</SectionLabel>
          <SectionHeading light>See a re-engagement campaign in action</SectionHeading>
          <p style={{ fontSize: 16, color: '#C2B9AE', lineHeight: 1.6 }}>
            Here is exactly what a campaign looks like inside TrayLoop.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Campaign header */}
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 700, color: color.white, marginBottom: 4 }}
            >
              Re-engage At-Risk Customers
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>
              Campaign &middot; Auto-created by TrayLoop AI
            </div>
          </div>

          {/* Target info row */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              padding: '20px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Segment', value: 'At-Risk' },
              { label: 'Targets', value: '23 customers' },
              { label: 'Est. Revenue', value: '$8,740' },
              { label: 'Channel', value: 'Email' },
            ].map((item) => (
              <div key={item.label} style={{ flex: '1 1 120px' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: color.muted,
                    marginBottom: 4,
                    textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: color.white }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Email preview */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: color.muted,
                marginBottom: 16,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Email Preview
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: 24,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: 13, color: color.muted, marginBottom: 4 }}>
                Subject:
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: color.white,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                We miss catering for your team, David
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#C2B9AE',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Hi David,
                <br />
                <br />
                It&#39;s been a few weeks since your last order with Downtown Kitchen. Your
                team used to love our Executive Lunch Package for 20 &mdash; and it&#39;s
                still here whenever you&#39;re ready.
                <br />
                <br />
                Your last order is saved and you can reorder with one click.
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(66,217,160,0.1)',
                  border: `1px solid ${color.teal}`,
                  marginBottom: 20,
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
                <div style={{ fontSize: 13, color: color.white, lineHeight: 1.5 }}>
                  &quot;Since your last order, we have added a new Southwest Bowl option
                  that&#39;s been popular with corporate groups your size. Same quality,
                  fresh twist.&quot;
                </div>
              </div>

              <div
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  backgroundColor: color.teal,
                  color: color.ink,
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Reorder Now &#8594;
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '20px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                padding: '10px 24px',
                backgroundColor: color.teal,
                color: color.ink,
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Approve &amp; Send
            </div>
            <div
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: color.white,
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}
            >
              Edit
            </div>
            <div
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: color.muted,
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                border: '1.5px solid rgba(255,255,255,0.1)',
              }}
            >
              Skip
            </div>
          </div>

          {/* Recipient table */}
          <div style={{ padding: '20px 28px' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: color.muted,
                marginBottom: 16,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              Recipients (4 of 23)
            </div>

            {/* Table header */}
            <div
              style={{
                display: 'flex',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: 11,
                fontWeight: 600,
                color: color.muted,
                textTransform: 'uppercase' as const,
                letterSpacing: 0.5,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ flex: '1 1 120px' }}>Name</span>
              <span style={{ flex: '1 1 140px' }}>Company</span>
              <span style={{ flex: '1 1 100px' }}>Last Order</span>
              <span style={{ flex: '1 1 80px', textAlign: 'right' }}>Avg Value</span>
            </div>

            {[
              {
                name: 'David Park',
                company: 'Meridian Group',
                lastOrder: '6 weeks ago',
                avgValue: '$520',
              },
              {
                name: 'Sarah Chen',
                company: 'Horizon Technologies',
                lastOrder: '5 weeks ago',
                avgValue: '$725',
              },
              {
                name: 'Michael Torres',
                company: 'Summit Legal Group',
                lastOrder: '4 weeks ago',
                avgValue: '$380',
              },
              {
                name: 'Jennifer Wu',
                company: 'Bright Horizons HR',
                lastOrder: '7 weeks ago',
                avgValue: '$450',
              },
            ].map((row) => (
              <div
                key={row.name}
                style={{
                  display: 'flex',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 13,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ flex: '1 1 120px', fontWeight: 500, color: color.white }}>
                  {row.name}
                </span>
                <span style={{ flex: '1 1 140px', color: color.muted }}>
                  {row.company}
                </span>
                <span style={{ flex: '1 1 100px', color: color.muted }}>
                  {row.lastOrder}
                </span>
                <span
                  style={{
                    flex: '1 1 80px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: color.white,
                  }}
                >
                  {row.avgValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          RESULTS
      ═══════════════════════════════════════════════ */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
          <SectionLabel>Results</SectionLabel>
          <SectionHeading>Revenue you would have lost, recovered.</SectionHeading>
          <p style={{ fontSize: 16, color: color.muted, lineHeight: 1.6 }}>
            Average results from TrayLoop restaurants using AI re-engagement.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            maxWidth: 840,
            margin: '0 auto',
          }}
        >
          {[
            { value: '$1,840/mo', label: 'Recovered revenue per month' },
            { value: '72%', label: 'Reorder rate when contacted' },
            { value: '3.2\u00d7', label: 'ROI on re-engagement outreach' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '36px 24px',
                backgroundColor: color.white,
                borderRadius: 14,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: color.teal,
                  marginBottom: 8,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 15, color: color.muted, lineHeight: 1.4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

    </main>
  );
}
