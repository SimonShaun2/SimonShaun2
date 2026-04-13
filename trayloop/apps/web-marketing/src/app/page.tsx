import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import PillButton from '@/components/pill-button';
import { featureAtlas, growthAdvisor, plans, revenuePillars } from '@/lib/marketing-story';

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

function Heading({
  title,
  summary,
  center = false,
}: {
  title: string;
  summary: string;
  center?: boolean;
}) {
  return (
    <div style={{ maxWidth: center ? 800 : 700, margin: center ? '0 auto' : '0' }}>
      <h2
        style={{
          fontSize: 42,
          lineHeight: 1.08,
          fontWeight: 800,
          color: C.ink,
          marginBottom: 16,
          textAlign: center ? 'center' : 'left',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.65,
          color: C.muted,
          textAlign: center ? 'center' : 'left',
        }}
      >
        {summary}
      </p>
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
        borderRadius: 24,
        padding: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PlanSurface({
  name,
  price,
  cadence,
  badge,
  summary,
  highlights,
}: (typeof plans)[number]) {
  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minHeight: '100%',
        boxShadow: '0 24px 60px rgba(26, 22, 18, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>Starts at</div>
      </div>

      <div>
        <h3 style={{ fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{name}</h3>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.ink }}>
          {price}
          <span style={{ fontSize: 16, fontWeight: 600, color: C.muted, marginLeft: 4 }}>{cadence}</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, marginTop: 10 }}>{summary}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          paddingTop: 2,
        }}
      >
        {highlights.slice(0, 4).map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: C.teal,
                flexShrink: 0,
                marginTop: 7,
              }}
            />
            <span style={{ fontSize: 15, lineHeight: 1.55, color: C.ink }}>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-reveal {
          animation: tlFadeUp 0.7s ease both;
        }
        .tl-delay-1 { animation-delay: 0.08s; }
        .tl-delay-2 { animation-delay: 0.16s; }
        .tl-delay-3 { animation-delay: 0.24s; }
        .tl-hover {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .tl-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(26, 22, 18, 0.08);
        }
        @keyframes tlFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 960px) {
          .tl-home-hero {
            grid-template-columns: 1fr !important;
          }
          .tl-home-plan-grid {
            grid-template-columns: 1fr !important;
          }
          .tl-home-lever-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section
        style={{
          background:
            'linear-gradient(180deg, #1A1612 0%, #231D17 62%, #F9F5EF 62%, #F9F5EF 100%)',
        }}
      >
        <div
          className="tl-home-hero"
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '72px 24px 96px',
            display: 'grid',
            gridTemplateColumns: '1.02fr 0.98fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div className="tl-reveal">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                backgroundColor: 'rgba(254,252,250,0.08)',
                color: C.white,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 22,
              }}
            >
              The catering revenue engine
            </div>

            <h1
              style={{
                fontSize: 66,
                lineHeight: 0.98,
                letterSpacing: '-0.04em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 680,
                marginBottom: 20,
              }}
            >
              Launch the storefront.
              <br />
              Grow repeat revenue.
              <br />
              Run the AI engine.
            </h1>

            <p
              style={{
                fontSize: 19,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
                marginBottom: 28,
              }}
            >
              TrayLoop gives restaurants a branded catering channel, recurring scheduling, upsells, and retention
              automation so every direct order can become the start of the next one.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
              <PillButton
                text="Start with Momentum"
                href="/signup"
                variant="primary"
                size="md"
                analyticsEvent="marketing_home_cta_click"
                analyticsProperties={{ placement: 'hero_primary' }}
              />
              <PillButton
                text="See pricing"
                href="/pricing"
                variant="ghost"
                size="md"
                analyticsEvent="marketing_home_cta_click"
                analyticsProperties={{ placement: 'hero_secondary' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="tl-hover"
                  style={{
                    padding: '16px 18px 18px',
                    borderRadius: 20,
                    backgroundColor: 'rgba(254,252,250,0.9)',
                    border: '1px solid rgba(26,22,18,0.08)',
                    color: C.ink,
                    boxShadow: '0 14px 30px rgba(26,22,18,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.orange }}>
                      {plan.name}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>{plan.badge}</div>
                  </div>
                  <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: 'rgba(26,22,18,0.08)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: plan.name === 'Launch' ? '38%' : plan.name === 'Momentum' ? '68%' : '88%',
                        borderRadius: 999,
                        background: plan.name === 'Launch'
                          ? 'linear-gradient(90deg, #E85618 0%, #F59E0B 100%)'
                          : plan.name === 'Momentum'
                            ? 'linear-gradient(90deg, #42D9A0 0%, #E85618 100%)'
                            : 'linear-gradient(90deg, #1D7A55 0%, #42D9A0 100%)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.55, color: C.ink, marginTop: 12 }}>
                    {plan.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tl-reveal tl-delay-1">
            <div
              style={{
                position: 'relative',
                minHeight: 620,
                borderRadius: 34,
                overflow: 'hidden',
                border: '1px solid rgba(254,252,250,0.1)',
                boxShadow: '0 26px 80px rgba(0, 0, 0, 0.25)',
                backgroundColor: '#2A2520',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=1500&fit=crop&q=80"
                alt="Catering trays and plated food ready for service"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(26,22,18,0.14) 0%, rgba(26,22,18,0.34) 42%, rgba(26,22,18,0.9) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 28,
                  color: C.white,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    alignSelf: 'flex-start',
                    padding: '8px 14px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(66,217,160,0.14)',
                    color: C.teal,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Direct catering that compounds
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  <div
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      backgroundColor: 'rgba(26,22,18,0.72)',
                      border: '1px solid rgba(254,252,250,0.12)',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <div style={{ fontSize: 13, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Revenue loop
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>Launch. Momentum. Engine.</div>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(254,252,250,0.8)', marginTop: 10 }}>
                      Launch gets you live, Momentum keeps the calendar full, and Engine turns retention into a
                      repeatable system.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {plans.map((plan, index) => (
                      <div
                        key={plan.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '88px 1fr',
                          gap: 14,
                          alignItems: 'stretch',
                          padding: 16,
                          borderRadius: 20,
                          backgroundColor: `rgba(254,252,250,${0.08 + index * 0.02})`,
                          border: '1px solid rgba(254,252,250,0.1)',
                        }}
                      >
                        <div
                          style={{
                            borderRadius: 14,
                            backgroundColor: index === 0 ? C.orange : index === 1 ? C.teal : '#CBB89A',
                            color: index === 1 ? C.ink : C.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 24,
                            letterSpacing: '-0.04em',
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{plan.name}</div>
                            <div style={{ color: 'rgba(254,252,250,0.74)', fontSize: 13 }}>{plan.price}{plan.cadence}</div>
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(254,252,250,0.74)', marginTop: 6 }}>
                            {plan.summary}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section bg={C.cream}>
        <div className="tl-reveal">
          <Eyebrow text="Why it matters" />
          <Heading
            title="The revenue story is simple: more orders, more repeats, more value per order."
            summary="TrayLoop is built around three levers that move catering revenue forward without adding a lot of manual work to the kitchen or the sales team."
          />
        </div>

        <div className="tl-home-lever-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 34 }}>
          {revenuePillars.map((pillar, index) => (
            <Card key={pillar.title} className="tl-hover" style={{ minHeight: 210 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#FFF0E9' : index === 1 ? '#E9FBF3' : '#F3EFE7',
                    color: index === 0 ? C.orange : index === 1 ? '#1D7A55' : C.ink,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  0{index + 1}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {plans[index].name}
                </div>
              </div>
              <h3 style={{ fontSize: 26, lineHeight: 1.05, fontWeight: 800, color: C.ink, margin: '18px 0 10px' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: C.muted }}>{pillar.summary}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section bg={C.white}>
        <div className="tl-reveal">
          <Eyebrow text="The stack" />
          <Heading
            title="Every tier adds a layer to the same revenue engine."
            summary="Launch gets you live, Momentum grows repeat orders, Engine adds AI and retention, and Growth Advisor sits beside the operator."
          />
        </div>

        <div className="tl-home-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 34 }}>
          {plans.map((plan) => (
            <PlanSurface key={plan.name} {...plan} />
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <Card style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 22, alignItems: 'center' }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.orange,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                Growth Advisor
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 10 }}>
                A premium strategy layer for the teams that want more than software.
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted, maxWidth: 720 }}>
                Growth Advisor helps you choose the next move without turning the page into another pricing pitch.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.ink }}>{growthAdvisor.price}<span style={{ fontSize: 16, color: C.muted }}>{growthAdvisor.cadence}</span></div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {growthAdvisor.badge}
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section bg={C.creamDark}>
        <div className="tl-reveal">
          <Eyebrow text="Capability map" />
          <Heading
            title="Built for the kitchen, the operator, and the revenue team at the same time."
            summary="The platform covers direct ordering, repeat revenue, AI growth, and the guidance layer that helps merchants decide what to do next."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginTop: 34 }}>
          {featureAtlas.map((group) => (
            <Card key={group.title} className="tl-hover" style={{ minHeight: 250 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 10 }}>{group.title}</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {group.items.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: C.teal,
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <span style={{ fontSize: 15, lineHeight: 1.55, color: C.ink }}>{item}</span>
                  </div>
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
            gap: 28,
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow text="Start the loop" />
            <h2 style={{ fontSize: 46, lineHeight: 1.04, fontWeight: 800, marginBottom: 16, maxWidth: 640 }}>
              Build the catering revenue engine your team can actually run.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              Launch the storefront, turn the first order into a repeat account, and use Engine when you are ready for
              AI-led growth automation.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="Book a demo" href="/demo" variant="primary" size="md" />
            <PillButton text="See pricing" href="/pricing" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
