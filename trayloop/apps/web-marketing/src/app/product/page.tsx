'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import PillButton from '@/components/pill-button';
import { featureAtlas, growthAdvisor, plans } from '@/lib/marketing-story';

const C = {
  cream: '#F8F3EC',
  creamDark: '#EEE4D2',
  ink: '#191510',
  orange: '#E85618',
  teal: '#44D9A1',
  muted: '#776A5F',
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
    <section className={className} style={{ backgroundColor: bg, padding: '84px 24px', ...style }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        color: C.orange,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );
}

function Heading({ title, summary, className }: { title: string; summary: string; className?: string }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <h2
        className={className}
        style={{
          fontSize: 40,
          lineHeight: 1.06,
          fontWeight: 800,
          color: C.ink,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 17, lineHeight: 1.65, color: C.muted, maxWidth: 700 }}>{summary}</p>
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
        backgroundColor: dark ? '#221D19' : C.white,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : `1px solid ${C.creamDark}`,
        borderRadius: 28,
        padding: 26,
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
      <span
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: light ? 'rgba(254,252,250,0.84)' : C.ink,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function MetricChip({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 16,
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFF7F0',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F2E3D3',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: dark ? 'rgba(254,252,250,0.68)' : C.muted }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: dark ? C.white : C.ink, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function StageMock({
  planName,
  dark = false,
}: {
  planName: (typeof plans)[number]['name'];
  dark?: boolean;
}) {
  const strips: Record<(typeof plans)[number]['name'], string[]> = {
    Launch: ['Storefront live', 'Minimums set', 'Deposit collected'],
    Momentum: ['Recurring orders', 'Upsell prompts', 'Saved templates'],
    Engine: ['AI campaigns', 'Lead scoring', 'Churn risk'],
  };

  return (
    <div
      style={{
        borderRadius: 22,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : '1px solid #E9DED0',
        background: dark ? 'linear-gradient(180deg, rgba(66,217,161,0.08) 0%, rgba(255,255,255,0.04) 100%)' : 'linear-gradient(180deg, #FFFDF9 0%, #FFF5E9 100%)',
        padding: 18,
        display: 'grid',
        gap: 14,
        minHeight: 232,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            backgroundColor: dark ? 'rgba(68,217,161,0.14)' : '#FFF0E6',
            color: dark ? C.teal : C.orange,
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {planName}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: dark ? 'rgba(254,252,250,0.68)' : C.muted }}>
          {planName === 'Launch' ? 'Sell direct' : planName === 'Momentum' ? 'Repeat revenue' : 'AI growth'}
        </div>
      </div>

      <div
        style={{
          borderRadius: 18,
          backgroundColor: dark ? 'rgba(26,22,18,0.72)' : '#FFFFFF',
          border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EADFCF',
          padding: 14,
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: dark ? 'rgba(254,252,250,0.72)' : C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TrayLoop workspace
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: dark ? C.teal : C.orange }}>
            Live
          </div>
        </div>
        {strips[planName].map((item, index) => (
          <div key={item} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: index === 2 ? (dark ? 'rgba(68,217,161,0.24)' : '#FEF3C7') : dark ? 'rgba(254,252,250,0.12)' : '#F6EFE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: dark ? C.white : C.orange,
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {index + 1}
            </div>
            <div style={{ height: 8, borderRadius: 999, backgroundColor: index === 2 ? (dark ? C.teal : C.orange) : dark ? 'rgba(254,252,250,0.16)' : '#E9DCCB' }} />
          </div>
        ))}
      </div>

      <div className="tl-product-stage-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {planName === 'Launch'
          ? ['Brand', 'Minimums', 'Deposit'].map((label) => <MetricChip key={label} label={label} value="Configured" dark={dark} />)
          : planName === 'Momentum'
            ? ['Repeat', 'Upsell', 'Templates'].map((label) => <MetricChip key={label} label={label} value="On" dark={dark} />)
            : ['AI', 'Signals', 'Follow-up'].map((label) => <MetricChip key={label} label={label} value="Active" dark={dark} />)}
      </div>
    </div>
  );
}

function StageCard({
  plan,
  reverse = false,
}: {
  plan: (typeof plans)[number];
  reverse?: boolean;
}) {
  const dark = plan.name === 'Engine';
  const accent = plan.name === 'Momentum' ? '#1D7A55' : plan.name === 'Engine' ? C.teal : C.orange;

  return (
    <div
      className="tl-product-hover"
      style={{
        display: 'grid',
        gridTemplateColumns: reverse ? '1fr 1.05fr' : '1.05fr 1fr',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      <Card
        dark={dark}
        style={{
          color: dark ? C.white : C.ink,
          display: 'grid',
          gap: 18,
          minHeight: 340,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            backgroundColor: dark ? 'rgba(68,217,161,0.14)' : plan.name === 'Momentum' ? '#E9FBF3' : '#FFF0E6',
            color: accent,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {plan.badge}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            {plan.name}
          </div>
          <h3 style={{ fontSize: 32, lineHeight: 1.02, fontWeight: 800, marginBottom: 10 }}>
            {plan.summary}
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: dark ? 'rgba(254,252,250,0.76)' : C.muted, maxWidth: 560 }}>
            {plan.detail}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline' }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{plan.price}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: dark ? 'rgba(254,252,250,0.72)' : C.muted }}>{plan.cadence}</div>
        </div>
      </Card>

      <Card
        style={{
          display: 'grid',
          gap: 18,
          background: dark
            ? 'linear-gradient(180deg, #2A241F 0%, #221D19 100%)'
            : plan.name === 'Launch'
              ? 'linear-gradient(180deg, #FFFDF9 0%, #FFF5E8 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #F0FBF6 100%)',
          color: dark ? C.white : C.ink,
        }}
      >
        <StageMock planName={plan.name} dark={dark} />

        <div style={{ display: 'grid', gap: 10 }}>
          {plan.highlights.slice(0, 3).map((item) => (
            <Bullet key={item} text={item} light={dark} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdvisorPreview() {
  const moves = [
    {
      label: 'Price higher',
      value: 'Start with the strongest package',
      detail: 'Raise the offer that already wins the most intent.',
    },
    {
      label: 'Upsell next',
      value: 'Add the right add-on at checkout',
      detail: 'Use premium sides, beverages, or service upgrades.',
    },
    {
      label: 'Reorder next',
      value: 'Time the follow-up after fulfillment',
      detail: 'Turn the last order into the next one.',
    },
    {
      label: 'Fix next',
      value: 'Clear the blocker before scaling traffic',
      detail: 'Lead time, minimums, and deposit policy first.',
    },
  ] as const;

  return (
    <div
      style={{
        borderRadius: 28,
        background: 'linear-gradient(180deg, #221D19 0%, #181411 100%)',
        color: C.white,
        border: '1px solid rgba(254,252,250,0.08)',
        padding: 20,
        boxShadow: '0 28px 70px rgba(15, 12, 10, 0.18)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Growth Advisor
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>A strategy layer, not a upsell banner.</div>
        </div>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            backgroundColor: 'rgba(68,217,161,0.12)',
            color: C.teal,
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Live snapshot
        </div>
      </div>

      <div className="tl-product-advisor-preview-grid" style={{ display: 'grid', gap: 12 }}>
        {moves.map((move, index) => (
          <div
            key={move.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 12,
              padding: 14,
              borderRadius: 18,
              backgroundColor: index === 0 ? 'rgba(232,86,24,0.12)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(254,252,250,0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: index === 0 ? '#FFD2BE' : C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {move.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>{move.value}</div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(254,252,250,0.74)' }}>{move.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureTile({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <Card className="tl-product-hover" style={{ minHeight: 220 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </div>
        <div style={{ width: 52, height: 4, borderRadius: 999, background: 'linear-gradient(90deg, #E85618 0%, #44D9A1 100%)' }} />
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <Bullet key={item} text={item} />
        ))}
      </div>
    </Card>
  );
}

export default function ProductPage() {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-product-fade {
          animation: tlFadeUp 0.7s ease both;
        }
        .tl-product-delay-1 { animation-delay: 0.1s; }
        .tl-product-delay-2 { animation-delay: 0.2s; }
        .tl-product-delay-3 { animation-delay: 0.3s; }
        .tl-product-hover {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .tl-product-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(26, 22, 18, 0.08);
        }
        @keyframes tlFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .tl-product-hero,
          .tl-product-stage,
          .tl-product-advisor {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 960px) {
          .tl-product-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .tl-product-section {
            padding: 64px 18px !important;
          }
          .tl-product-hero-title {
            font-size: 42px !important;
            line-height: 1.02 !important;
          }
          .tl-product-section-title {
            font-size: 32px !important;
            line-height: 1.08 !important;
          }
          .tl-product-body-copy {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }
          .tl-product-hero-canvas {
            min-height: 420px !important;
          }
          .tl-product-chip-grid,
          .tl-product-stage-metrics {
            grid-template-columns: 1fr !important;
          }
          .tl-product-advisor-preview-grid {
            grid-template-columns: 1fr !important;
          }
          .tl-product-closing {
            grid-template-columns: 1fr !important;
          }
          .tl-product-closing-actions {
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <Section bg={C.ink} style={{ paddingTop: 72, paddingBottom: 72 }} className="tl-product-section">
        <div
          className="tl-product-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.05fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div className="tl-product-fade">
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
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 20,
              }}
            >
              Product overview
            </div>

            <h1
              className="tl-product-hero-title"
              style={{
                fontSize: 64,
                lineHeight: 0.98,
                letterSpacing: '-0.045em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 640,
                marginBottom: 16,
              }}
            >
              Launch.
              <br />
              Momentum.
              <br />
              Engine.
            </h1>
            <p
              className="tl-product-body-copy"
              style={{
                fontSize: 19,
                lineHeight: 1.65,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
              }}
            >
              TrayLoop starts with a branded storefront, grows repeat revenue, and finishes with AI that keeps the next order in motion.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
              <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
              <PillButton text="How it works" href="/how-it-works" variant="ghost" size="md" />
            </div>

            <div className="tl-product-chip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 28, maxWidth: 620 }}>
              <MetricChip label="Launch" value="Get live" dark />
              <MetricChip label="Momentum" value="Build repeat" dark />
              <MetricChip label="Engine" value="Compounds" dark />
            </div>
          </div>

          <div className="tl-product-fade tl-product-delay-1">
            <div
              className="tl-product-hero-canvas"
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
                src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&h=1500&fit=crop&q=80"
                alt="Catering team preparing a large order"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(26,22,18,0.06) 0%, rgba(26,22,18,0.28) 42%, rgba(26,22,18,0.92) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: 26,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: C.white,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {['Launch live', 'Momentum grows baskets', 'Engine closes the loop'].map((chip, index) => (
                    <div
                      key={chip}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        backgroundColor: index === 2 ? 'rgba(68,217,161,0.14)' : 'rgba(255,255,255,0.08)',
                        color: index === 2 ? C.teal : C.white,
                        border: '1px solid rgba(254,252,250,0.1)',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {chip}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 12,
                    padding: 18,
                    borderRadius: 22,
                    backgroundColor: 'rgba(26,22,18,0.72)',
                    border: '1px solid rgba(254,252,250,0.12)',
                    backdropFilter: 'blur(14px)',
                    maxWidth: 420,
                  }}
                >
                  <div style={{ fontSize: 12, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Product layer
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>One operating system for direct catering.</div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(254,252,250,0.78)' }}>
                    Merchants launch the storefront, repeat orders start compounding, and AI takes over the next move.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bg={C.white} className="tl-product-section">
        <div className="tl-product-fade">
          <Eyebrow text="The ladder" />
          <Heading
            className="tl-product-section-title"
            title="Three stages, one product story."
            summary="Each tier adds a clear layer of leverage instead of resetting the account or making the merchant relearn the workflow."
          />
        </div>

        <div className="tl-product-stage" style={{ display: 'grid', gap: 18, marginTop: 34 }}>
          {plans.map((plan, index) => (
            <div key={plan.name} className={`tl-product-fade tl-product-delay-${index + 1}`}>
              <StageCard plan={plan} reverse={index % 2 === 1} />
            </div>
          ))}
        </div>
      </Section>

      <Section bg={C.creamDark} className="tl-product-section">
        <div className="tl-product-fade">
          <Eyebrow text="Growth Advisor" />
          <Heading
            className="tl-product-section-title"
            title="The strategy layer feels like an operator sitting next to the merchant."
            summary="It turns live storefront data into a short list of decisions: what to price higher, what to upsell, what to reorder, and what to fix next."
          />
        </div>

        <div className="tl-product-advisor" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 20, alignItems: 'start', marginTop: 30 }}>
          <Card style={{ display: 'grid', gap: 18 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 20,
                background: '#FFF8F2',
                border: '1px solid #F3E1D1',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Premium add-on
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 8 }}>{growthAdvisor.name}</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, marginTop: 8 }}>
                {growthAdvisor.detail}
              </p>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {growthAdvisor.highlights.map((item) => (
                <Bullet key={item} text={item} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.ink }}>{growthAdvisor.price}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>{growthAdvisor.cadence}</div>
            </div>
          </Card>

          <AdvisorPreview />
        </div>
      </Section>

      <Section bg={C.white} className="tl-product-section">
        <div className="tl-product-fade">
          <Eyebrow text="Capability atlas" />
          <Heading
            className="tl-product-section-title"
            title="The features stay focused on direct catering."
            summary="Every block is there to increase conversion, repeat rate, or operator confidence."
          />
        </div>

        <div className="tl-product-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginTop: 30 }}>
          {featureAtlas.map((group, index) => (
            <div key={group.title} className={`tl-product-fade tl-product-delay-${Math.min(index + 1, 3)}`}>
              <FeatureTile title={group.title} items={group.items.slice(0, 3)} />
            </div>
          ))}
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '92px 24px' }}>
        <div
          className="tl-product-closing"
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
            <h2 style={{ fontSize: 44, lineHeight: 1.04, fontWeight: 800, marginBottom: 14, maxWidth: 640 }}>
              Launch gets the order. Momentum grows it. Engine compounds it.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              That is the product story in one line, and it is the story every page should tell.
            </p>
          </div>
          <div className="tl-product-closing-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
            <PillButton text="How it works" href="/how-it-works" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
