import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

/* ── Design tokens ── */
const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

/* ── Section wrapper ── */
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
      <div style={{ maxWidth: 960, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Label({ text, color = C.orange }: { text: string; color?: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: 16,
      }}
    >
      {text}
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOW IT WORKS PAGE
   ══════════════════════════════════════════════ */
export default function HowItWorksPage() {
  return (
    <main>
      {/* ═══ HERO ═══ */}
      <Section bg={C.cream} style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Label text="How It Works" />
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            How TrayLoop works.
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              color: C.muted,
              marginBottom: 20,
              maxWidth: 640,
              margin: '0 auto 20px',
            }}
          >
            A direct ordering system that replaces marketplaces — so every catering dollar stays
            with your restaurant.
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: C.ink,
              marginBottom: 36,
            }}
          >
            This replaces how you currently take catering orders. Nothing else changes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton
              text="Start Keeping Your Revenue →"
              href="https://dashboard.trayloophq.com/register"
              variant="primary"
            />
            <PillButton text="See a Live Storefront →" href="https://order.trayloophq.com/downtown-kitchen" variant="ghost" />
          </div>
        </div>
      </Section>

      {/* ═══ BEFORE → AFTER ═══ */}
      <Section bg={C.white}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: C.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          What changes when you switch.
        </h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Before */}
          <div
            style={{
              flex: '1 1 400px',
              backgroundColor: C.cream,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${C.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.red,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              Before
            </div>
            {[
              'Orders come through calls, emails, and marketplaces',
              'You follow up manually — when you remember',
              'Customers order once, then disappear',
              'Revenue resets to zero every Monday',
            ].map((text) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#FDEAEA',
                    color: C.red,
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  ✕
                </span>
                <span style={{ fontSize: 15, color: C.ink, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* After */}
          <div
            style={{
              flex: '1 1 400px',
              backgroundColor: C.white,
              borderRadius: 16,
              padding: 32,
              border: `2px solid ${C.teal}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.teal,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              After
            </div>
            {[
              'Every order comes through one link',
              'Payments and deposits handled automatically',
              'Customers reorder without you chasing them',
              'Revenue builds month over month',
            ].map((text) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: C.teal,
                    flexShrink: 0,
                    marginTop: 8,
                  }}
                />
                <span style={{ fontSize: 15, color: C.ink, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ HOW IT WORKS — 3 STEPS ═══ */}
      <Section bg={C.cream}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Label text="The System" />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.2,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            Three things happen automatically after you set it up.
          </h2>
        </div>

        {/* Step 1 */}
        <StepRow
          number="01"
          title="Orders come directly to you."
          paragraphs={[
            'Customers order through your link. Not a marketplace.',
            'They see your menu, your packages, your pricing. Payments are handled at checkout — automatically.',
            'No commissions. No middleman. The order lands with you.',
          ]}
        />

        {/* Step 2 */}
        <StepRow
          number="02"
          title="The order runs itself."
          paragraphs={[
            'Deposits are collected the moment the order is placed.',
            'Confirmation goes out instantly. Reminders go out before the event.',
            "You're not managing this. You're running your kitchen.",
          ]}
        />

        {/* Step 3 */}
        <StepRow
          number="03"
          title="Customers come back."
          paragraphs={[
            'The system tracks how often each customer orders.',
            'When someone is due to reorder, TrayLoop reaches out — at the right time, with the right message.',
            'No generic blasts. No chasing. They reorder on their own.',
          ]}
          isLast
        />
      </Section>

      {/* ═══ ONE SYSTEM LINE ═══ */}
      <Section bg={C.ink} style={{ padding: '64px 24px' }}>
        <p
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.white,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
          Everything runs through one system —{' '}
          <span style={{ color: C.teal }}>ordering, payments, follow-ups, and reorders.</span>
        </p>
      </Section>

      {/* ═══ WHAT HAPPENS AFTER SIGNUP ═══ */}
      <Section bg={C.white}>
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 360px' }}>
            <Label text="After You Sign Up" />
            <h2
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              We handle the setup for you.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: C.ink,
                fontWeight: 600,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              You don&apos;t need to learn anything new.
            </p>
            <p
              style={{
                fontSize: 17,
                color: C.ink,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              You don&apos;t need to change how you run your kitchen.
            </p>
          </div>
          <div style={{ flex: '1 1 360px' }}>
            <div
              style={{
                backgroundColor: C.cream,
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${C.creamDark}`,
              }}
            >
              {[
                { label: 'Your menu and ordering page', status: 'Built for you' },
                { label: 'Payments and deposits', status: 'Connected' },
                { label: 'Your branded ordering link', status: 'Live' },
                { label: 'Follow-ups and reorders', status: 'Running' },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.creamDark}`,
                  }}
                >
                  <span style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{item.label}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.teal,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: C.teal,
                      }}
                    />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ CONTROL SECTION ═══ */}
      <Section bg={C.cream}>
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Label text="You Stay in Control" />
          <h2
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.25,
              marginBottom: 20,
            }}
          >
            You can still take orders however you want — TrayLoop just becomes your system.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: C.muted,
              lineHeight: 1.6,
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            Phone orders. Email orders. Walk-ups. Events. Everything flows into the same place,
            tracked the same way, followed up the same way.
          </p>
          <p
            style={{
              fontSize: 17,
              color: C.ink,
              fontWeight: 600,
              marginTop: 16,
            }}
          >
            Your rules. Your menu. Your customers.
          </p>
        </div>
      </Section>

      {/* ═══ WHAT'S RUNNING BEHIND THIS ═══ */}
      <Section bg={C.white}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Label text="What's Running Behind This" />
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.2,
            }}
          >
            Everything you need. Nothing to configure.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            maxWidth: 860,
            margin: '0 auto 32px',
          }}
        >
          {['Ordering', 'Payments', 'Deposits', 'Customer tracking', 'Follow-ups', 'Reorders'].map(
            (item) => (
              <div
                key={item}
                style={{
                  backgroundColor: C.cream,
                  border: `1px solid ${C.creamDark}`,
                  borderRadius: 12,
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {item}
              </div>
            ),
          )}
        </div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.ink,
            textAlign: 'center',
          }}
        >
          All handled in one system.
        </p>
      </Section>

      {/* ═══ COMPOUNDING CLOSE ═══ */}
      <Section bg={C.creamDark}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            Once it&apos;s set up, your catering doesn&apos;t reset. It builds.
          </h2>
          <p
            style={{
              fontSize: 18,
              color: C.muted,
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            Every order becomes a customer. Every customer becomes recurring revenue.
          </p>
          <p
            style={{
              fontSize: 18,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            The system keeps running while you run service.
          </p>
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section bg={C.cream}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            The simplest way to stop losing catering revenue.
          </h2>
          <p style={{ fontSize: 17, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
            No new workflows. No disruption. We handle the setup — you keep running your restaurant.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton
              text="Start Keeping Your Revenue Today →"
              href="https://dashboard.trayloophq.com/register"
              variant="primary"
            />
            <PillButton
              text="See a Live Storefront →"
              href="https://order.trayloophq.com/downtown-kitchen"
              variant="ghost"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}

/* ── Step row helper ── */
function StepRow({
  number,
  title,
  paragraphs,
  isLast,
}: {
  number: string;
  title: string;
  paragraphs: string[];
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 40,
        flexWrap: 'wrap',
        paddingBottom: isLast ? 0 : 40,
        marginBottom: isLast ? 0 : 40,
        borderBottom: isLast ? 'none' : `1px solid ${C.creamDark}`,
      }}
    >
      <div style={{ flex: '0 0 auto', minWidth: 120 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: C.orange,
            lineHeight: 1,
          }}
        >
          {number}
        </div>
      </div>
      <div style={{ flex: '1 1 480px' }}>
        <h3
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1.25,
            marginBottom: 16,
          }}
        >
          {title}
        </h3>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: C.muted,
              marginBottom: i === paragraphs.length - 1 ? 0 : 12,
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
