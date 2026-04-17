import type { CSSProperties, ReactNode } from 'react';
import PillButton from '@/components/pill-button';
import { growthAdvisor, plans, pricingFaqs, pricingRows } from '@/lib/marketing-story';

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
  className,
}: {
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <section className={className} style={{ backgroundColor: bg, padding: '88px 24px', ...style }}>
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

function Heading({ title, summary, className }: { title: string; summary: string; className?: string }) {
  return (
    <div style={{ maxWidth: 780 }}>
      <h2
        className={className}
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
  accent = C.creamDark,
  style,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  accent?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: dark ? '#231E19' : C.white,
        borderRadius: 26,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : `1px solid ${accent}`,
        padding: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatusDot({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: on ? C.teal : '#D8CEC0',
        display: 'inline-block',
      }}
    />
  );
}

function PlanCard({
  plan,
  featured = false,
}: {
  plan: (typeof plans)[number];
  featured?: boolean;
}) {
  return (
    <Card
      accent={featured ? C.orange : C.creamDark}
      style={{
        boxShadow: featured ? '0 24px 60px rgba(232,86,24,0.12)' : '0 18px 46px rgba(26, 22, 18, 0.06)',
        transform: featured ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            backgroundColor: featured ? '#FFF0E9' : '#F5EEE4',
            color: featured ? C.orange : C.muted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {plan.badge}
        </div>
        {featured ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Most popular
          </div>
        ) : null}
      </div>

      <h3 style={{ fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{plan.name}</h3>
      <div style={{ fontSize: 38, fontWeight: 800, color: C.ink }}>
        {plan.price}
        <span style={{ fontSize: 16, fontWeight: 600, color: C.muted, marginLeft: 4 }}>{plan.cadence}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 12 }}>
        {plan.bestFor}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: C.muted, margin: '12px 0 18px' }}>{plan.summary}</p>

      <div style={{ display: 'grid', gap: 10 }}>
        {plan.highlights.map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <StatusDot on />
            <span style={{ fontSize: 15, lineHeight: 1.55, color: C.ink }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <PillButton
          text={featured ? 'Start with this plan' : 'Get started'}
          href="/signup"
          variant={featured ? 'primary' : 'secondary'}
          size="md"
        />
      </div>
    </Card>
  );
}

function ComparisonCell({ on, label }: { on: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 54 }}>
      <span className="tl-pricing-mobile-label" style={{ display: 'none', fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 10 }}>
        {label}
      </span>
      <StatusDot on={on} />
    </div>
  );
}

export default function PricingPage() {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .tl-pricing-compare {
          display: grid;
          grid-template-columns: minmax(260px, 1.2fr) repeat(3, minmax(110px, 0.8fr));
          gap: 0;
          align-items: stretch;
        }
        .tl-pricing-row {
          display: grid;
          grid-template-columns: minmax(260px, 1.2fr) repeat(3, minmax(110px, 0.8fr));
          border-top: 1px solid #E5DCCD;
        }
        .tl-pricing-row > div {
          padding: 16px 18px;
        }
        .tl-pricing-row:nth-child(odd) {
          background: rgba(255,255,255,0.65);
        }
        @media (max-width: 960px) {
          .tl-pricing-hero,
          .tl-pricing-addon-header,
          .tl-pricing-addon-grid,
          .tl-pricing-addon-cards,
          .tl-pricing-closing {
            grid-template-columns: 1fr !important;
          }
          .tl-pricing-grid {
            grid-template-columns: 1fr !important;
          }
          .tl-pricing-compare,
          .tl-pricing-row {
            grid-template-columns: 1fr !important;
          }
          .tl-pricing-row > div {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .tl-pricing-mobile-label {
            display: inline-block !important;
          }
        }
        @media (max-width: 768px) {
          .tl-pricing-section {
            padding: 64px 18px !important;
          }
          .tl-pricing-section > div {
            max-width: 560px !important;
            margin: 0 auto !important;
          }
          .tl-pricing-hero-title {
            font-size: 42px !important;
            line-height: 1.02 !important;
          }
          .tl-pricing-section-title {
            font-size: 32px !important;
            line-height: 1.08 !important;
          }
          .tl-pricing-body-copy {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }
          .tl-pricing-grid,
          .tl-pricing-addon-cards {
            max-width: 560px !important;
            margin-inline: auto !important;
          }
          .tl-pricing-hero > div:first-child,
          .tl-pricing-heading-block,
          .tl-pricing-addon-header > div:first-child,
          .tl-pricing-closing > div:first-child {
            text-align: center !important;
            margin-inline: auto !important;
          }
          .tl-pricing-hero-actions,
          .tl-pricing-closing-actions {
            justify-content: center !important;
          }
          .tl-pricing-addon-header > div:last-child {
            text-align: center !important;
          }
          .tl-pricing-header-cell {
            display: none !important;
          }
          .tl-pricing-header-feature {
            border-bottom: 1px solid #E5DCCD;
          }
        }
      `}</style>

      <Section bg={C.cream} className="tl-pricing-section">
        <div
          className="tl-pricing-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 36,
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow text="Pricing" />
            <h1
              className="tl-pricing-hero-title"
              style={{
                fontSize: 68,
                lineHeight: 0.98,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: '-0.04em',
                maxWidth: 680,
                marginBottom: 18,
              }}
            >
              Choose the tier that matches the growth engine you want to build.
            </h1>
            <p className="tl-pricing-body-copy" style={{ fontSize: 18, lineHeight: 1.7, color: C.muted, maxWidth: 620 }}>
              Launch gets the storefront live. Momentum turns orders into repeat revenue. Engine layers in AI,
              campaigns, and retention intelligence.
            </p>

            <div className="tl-pricing-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <PillButton text="Start with Momentum" href="/signup" variant="primary" size="md" />
              <PillButton text="See how it works" href="/how-it-works" variant="ghost" size="md" />
            </div>
          </div>

          <Card
            dark
            style={{
              color: C.white,
              padding: 30,
              display: 'grid',
              gap: 16,
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
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                alignSelf: 'flex-start',
              }}
            >
              Revenue ladder
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>Three tiers, one compounding story.</div>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(254,252,250,0.88)' }}>
              Every tier is built to move the same account forward: Launch gets the order live, Momentum repeats it,
              and Engine automates what happens next.
            </p>

            <div style={{ display: 'grid', gap: 10, marginTop: 6 }}>
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    backgroundColor: index === 1 ? 'rgba(66,217,160,0.12)' : 'rgba(254,252,250,0.06)',
                    border: index === 1 ? '1px solid rgba(66,217,160,0.24)' : '1px solid rgba(254,252,250,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{plan.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: index === 1 ? C.teal : 'rgba(254,252,250,0.9)' }}>
                      {plan.price}
                      {plan.cadence}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(254,252,250,0.88)', marginTop: 8 }}>
                    {plan.summary}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section bg={C.white} className="tl-pricing-section">
        <div className="tl-pricing-heading-block" style={{ maxWidth: 980 }}>
          <Eyebrow text="Packages" />
          <Heading
            className="tl-pricing-section-title"
            title="Launch, Momentum, and Engine are built to map to the way catering revenue actually grows."
            summary="Launch is for the first direct orders. Momentum is for recurring scheduling and upsells. Engine is for AI guided retention and growth automation."
          />
        </div>

        <div className="tl-pricing-grid" style={{ marginTop: 34 }}>
          <PlanCard plan={plans[0]} />
          <PlanCard plan={plans[1]} featured />
          <PlanCard plan={plans[2]} />
        </div>
      </Section>

      <Section bg={C.creamDark} className="tl-pricing-section">
        <div className="tl-pricing-addon-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <Eyebrow text="Addition" />
            <h2 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 800, color: C.ink, marginBottom: 12 }}>
              Growth Advisor is the strategist beside the operator.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, maxWidth: 760 }}>
              Use it when pricing, menu mix, or follow up needs a sharper second set of eyes.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.ink }}>
              {growthAdvisor.price}
              <span style={{ fontSize: 16, color: C.muted }}>{growthAdvisor.cadence}</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                backgroundColor: '#FFF0E9',
                color: C.orange,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 10,
              }}
            >
              {growthAdvisor.badge}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <Card className="tl-pricing-addon-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 22, alignItems: 'stretch' }}>
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
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 10 }}>
                Turns live signals into a 30-day plan.
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted, maxWidth: 760 }}>
                {growthAdvisor.detail}
              </p>
            </div>
            <div
              style={{
                borderRadius: 22,
                background: 'linear-gradient(180deg, #221D19 0%, #171311 100%)',
                padding: 18,
                color: C.white,
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                What it surfaces
              </div>
              {[
                'Price the strongest offer higher.',
                'Keep the right extra visible at the right moment.',
                'Time the next order before the last one cools off.',
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '30px 1fr',
                    gap: 12,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? 'rgba(232,86,24,0.18)' : 'rgba(66,217,160,0.16)',
                      color: index === 0 ? C.orange : C.teal,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(254,252,250,0.86)' }}>{item}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="tl-pricing-addon-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, marginTop: 18 }}>
            {[
              {
                title: 'Pricing direction',
                body: 'See where the first price lift should happen.',
              },
              {
                title: 'Offer mix',
                body: 'Decide what to sell first and what to bundle.',
              },
              {
                title: 'Follow up timing',
                body: 'Pick the next move before the opportunity cools off.',
              },
            ].map((item) => (
              <Card key={item.title} style={{ minHeight: 120 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section bg={C.white} className="tl-pricing-section">
        <div className="tl-pricing-heading-block">
          <Eyebrow text="Plan comparison" />
          <Heading
            className="tl-pricing-section-title"
            title="See what changes as you move from storefront to repeat revenue to AI growth."
            summary="The base stack stays the same. Each tier simply adds the next layer of compounding capability."
          />
        </div>

        <div style={{ marginTop: 28, border: '1px solid #E5DCCD', borderRadius: 26, overflow: 'hidden' }}>
          <div className="tl-pricing-compare" style={{ backgroundColor: '#F5EEE4', fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <div className="tl-pricing-header-feature" style={{ padding: '16px 18px' }}>Feature</div>
            <div className="tl-pricing-header-cell" style={{ padding: '16px 18px', textAlign: 'center' }}>Launch</div>
            <div className="tl-pricing-header-cell" style={{ padding: '16px 18px', textAlign: 'center' }}>Momentum</div>
            <div className="tl-pricing-header-cell" style={{ padding: '16px 18px', textAlign: 'center' }}>Engine</div>
          </div>

          {pricingRows.map((row) => (
            <div key={row.feature} className="tl-pricing-row">
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{row.feature}</div>
              <ComparisonCell on={row.launch} label="Launch" />
              <ComparisonCell on={row.momentum} label="Momentum" />
              <ComparisonCell on={row.engine} label="Engine" />
            </div>
          ))}
        </div>
      </Section>

      <Section bg={C.cream} className="tl-pricing-section">
        <div className="tl-pricing-heading-block">
          <Eyebrow text="FAQ" />
          <Heading
            className="tl-pricing-section-title"
            title="A few practical questions before you choose a tier."
            summary="The pricing ladder is meant to be simple, but merchants still need to know what unlocks what and how the added layer fits in."
          />
        </div>

        <div style={{ display: 'grid', gap: 16, marginTop: 30 }}>
          {pricingFaqs.map((faq) => (
            <Card key={faq.q} style={{ padding: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 10 }}>{faq.q}</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted }}>{faq.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '96px 24px' }}>
        <div
          className="tl-pricing-closing"
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
            <Eyebrow text="Ready to start" />
            <h2 style={{ fontSize: 46, lineHeight: 1.04, fontWeight: 800, marginBottom: 16, maxWidth: 650 }}>
              Pick the tier that matches how fast you want catering to compound.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              Start with Momentum if you want repeat orders and upsells, then step into Engine when AI and retention
              become the growth moat.
            </p>
          </div>
          <div className="tl-pricing-closing-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="Get started" href="/signup" variant="primary" size="md" />
            <PillButton text="Book a demo" href="/demo" variant="ghost" size="md" />
          </div>
        </div>
      </section>
      {/* Thin cream divider so the dark closing CTA doesn't fuse with the dark footer pre-footer section */}
      <div aria-hidden="true" style={{ height: 3, backgroundColor: '#F9F5EF' }} />
    </main>
  );
}
