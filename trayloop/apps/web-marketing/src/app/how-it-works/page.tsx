import type { CSSProperties, ReactNode } from 'react';
import PillButton from '@/components/pill-button';
import { howItWorksSteps, plans } from '@/lib/marketing-story';

const C = {
  cream: '#F9F5EF',
  creamDark: '#EFE7DB',
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
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section style={{ backgroundColor: bg, padding: '88px 24px', ...style }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: C.orange,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );
}

function Heading({ title, summary }: { title: string; summary: string }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <h2
        style={{
          fontSize: 42,
          lineHeight: 1.08,
          fontWeight: 800,
          color: C.ink,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted }}>{summary}</p>
    </div>
  );
}

function Card({
  children,
  dark = false,
  className,
  style,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: dark ? '#231E19' : C.white,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : `1px solid ${C.creamDark}`,
        borderRadius: 26,
        padding: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bullet({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: light ? C.teal : C.orange,
          flexShrink: 0,
          marginTop: 7,
        }}
      />
      <span style={{ fontSize: 15, lineHeight: 1.6, color: light ? 'rgba(254,252,250,0.82)' : C.ink }}>
        {text}
      </span>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-how-fade {
          animation: tlFadeUp 0.7s ease both;
        }
        .tl-how-delay-1 { animation-delay: 0.1s; }
        .tl-how-delay-2 { animation-delay: 0.2s; }
        .tl-how-delay-3 { animation-delay: 0.3s; }
        .tl-how-hover {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .tl-how-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(26, 22, 18, 0.08);
        }
        @keyframes tlFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 960px) {
          .tl-how-hero,
          .tl-how-step {
            grid-template-columns: 1fr !important;
          }
          .tl-how-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Section bg={C.ink} style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div
          className="tl-how-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.95fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div className="tl-how-fade">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                backgroundColor: 'rgba(254,252,250,0.08)',
                color: C.teal,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              How it works
            </div>

            <h1
              style={{
                fontSize: 66,
                lineHeight: 0.98,
                letterSpacing: '-0.04em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 700,
                marginBottom: 18,
              }}
            >
              From first order to repeat revenue.
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
              }}
            >
              TrayLoop connects the storefront, the kitchen, and the follow-up loop so the order keeps moving after
              the customer pays the deposit.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
              <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
              <PillButton text="View product" href="/product" variant="ghost" size="md" />
            </div>
          </div>

          <div className="tl-how-fade tl-how-delay-1">
            <Card
              dark
              style={{
                color: C.white,
                display: 'grid',
                gap: 18,
                boxShadow: '0 24px 60px rgba(26, 22, 18, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(66,217,160,0.14)',
                  color: C.teal,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                }}
              >
                Revenue loop
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {plans.map((plan, index) => (
                  <div
                    key={plan.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '86px 1fr',
                      gap: 14,
                      alignItems: 'stretch',
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor:
                        index === 0 ? 'rgba(232,86,24,0.12)' : index === 1 ? 'rgba(66,217,160,0.12)' : 'rgba(254,252,250,0.06)',
                      border:
                        index === 0
                          ? '1px solid rgba(232,86,24,0.2)'
                          : index === 1
                          ? '1px solid rgba(66,217,160,0.18)'
                          : '1px solid rgba(254,252,250,0.08)',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 16,
                        backgroundColor: index === 0 ? C.orange : index === 1 ? C.teal : '#D7C2A1',
                        color: index === 1 ? C.ink : C.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ fontSize: 17, fontWeight: 800 }}>{plan.name}</div>
                        <div style={{ fontSize: 14, color: 'rgba(254,252,250,0.72)' }}>
                          {plan.price}
                          {plan.cadence}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(254,252,250,0.76)', marginTop: 6 }}>
                        {plan.summary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section bg={C.white}>
        <div className="tl-how-fade">
          <Eyebrow text="The sequence" />
          <Heading
            title="The workflow is simple: launch the storefront, capture the order, then keep the next order in motion."
            summary="The pages and products all point back to the same loop so the story is easy to understand and the product is easy to run."
          />
        </div>

        <div style={{ display: 'grid', gap: 18, marginTop: 34 }}>
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.number}
              className={`tl-how-step tl-how-fade tl-how-delay-${index + 1}`}
              style={{
                display: 'grid',
                gridTemplateColumns: index % 2 === 0 ? '0.92fr 1.08fr' : '1.08fr 0.92fr',
                gap: 20,
                alignItems: 'stretch',
              }}
            >
              <Card className="tl-how-hover">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 999,
                    backgroundColor: '#F6EFE5',
                    color: C.orange,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 18,
                  }}
                >
                  {step.number}
                </div>
                <h3 style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 800, color: C.ink, marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, marginBottom: 18 }}>{step.summary}</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {step.bullets.map((bullet) => (
                    <Bullet key={bullet} text={bullet} />
                  ))}
                </div>
              </Card>

              <Card
                dark={index === 0 || index === 3}
                style={{
                  color: index === 0 || index === 3 ? C.white : C.ink,
                  display: 'grid',
                  gap: 16,
                }}
              >
                {index === 0 ? (
                  <>
                    <div style={{ fontSize: 13, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Setup
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Launch, Momentum, or Engine.</div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(254,252,250,0.78)' }}>
                      The merchant chooses the right tier and Growth Advisor can be attached when strategy matters.
                    </p>
                  </>
                ) : index === 1 ? (
                  <>
                    <div style={{ fontSize: 13, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Storefront setup
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {['Brand', 'Menu', 'Lead time', 'Minimum', 'Deposit', 'Location'].map((item) => (
                        <div
                          key={item}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: '1px solid rgba(26,22,18,0.08)',
                          }}
                        >
                          <span style={{ fontSize: 15, color: C.muted }}>{item}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Configured</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : index === 2 ? (
                  <>
                    <div style={{ fontSize: 13, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Order ticket
                    </div>
                    <div
                      style={{
                        borderRadius: 20,
                        padding: 18,
                        backgroundColor: '#FFF8F2',
                        border: '1px solid #F1E0CF',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                        <div style={{ fontWeight: 800, color: C.ink }}>Order #300674532</div>
                        <div style={{ color: C.orange, fontWeight: 700 }}>Deposit collected</div>
                      </div>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {['Executive Lunch x 40', 'Pickup at Downtown Kitchen', 'Customer email and phone saved', 'Merchant email mirrors the ticket'].map((item) => (
                          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: C.teal,
                                marginTop: 7,
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: 15, lineHeight: 1.55, color: C.ink }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Retention
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Momentum feeds Engine.</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {['Recurring scheduling', 'Upsell and reorder prompts', 'AI follow-up drafts', 'Lead scoring and churn risk'].map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: C.teal,
                              marginTop: 7,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(254,252,250,0.78)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>
          ))}
        </div>
      </Section>

      <Section bg={C.creamDark}>
        <div className="tl-how-fade">
          <Eyebrow text="What each team sees" />
          <Heading
            title="Customers, kitchens, and operators all get the right version of the same order."
            summary="The flow is designed so the merchant dashboard, the order email, and the follow-up logic stay aligned instead of becoming separate systems."
          />
        </div>

        <div className="tl-how-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, marginTop: 34 }}>
          {[
            {
              title: 'Customer',
              bullets: ['Branded checkout', 'Deposit and order confirmation', 'Repeat booking path', 'Clear order updates'],
            },
            {
              title: 'Kitchen',
              bullets: ['Standard ticket-style order summary', 'Item counts and modifiers', 'Service timing and location', 'Fulfillment-ready details'],
            },
            {
              title: 'Operator',
              bullets: ['Merchant dashboard order view', 'Follow-up and reactivation prompts', 'Recurring scheduling and upsell signals', 'Growth Advisor guidance when needed'],
            },
          ].map((panel) => (
            <Card key={panel.title} className="tl-how-hover">
              <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {panel.title}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {panel.bullets.map((bullet) => (
                  <Bullet key={bullet} text={bullet} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '96px 24px' }}>
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow text="Ready for the loop" />
            <h2 style={{ fontSize: 46, lineHeight: 1.04, fontWeight: 800, marginBottom: 16, maxWidth: 650 }}>
              Launch gets you live. Momentum keeps it moving. Engine compounds it.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              That is the working model behind the redesign. Every page should show how the platform turns a single
              catering order into a repeat relationship.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
            <PillButton text="View product" href="/product" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
