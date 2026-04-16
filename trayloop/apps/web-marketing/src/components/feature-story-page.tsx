import type { CSSProperties, ReactNode } from 'react';
import PillButton from '@/components/pill-button';
import { growthAdvisor, plans } from '@/lib/marketing-story';
import type { FeatureStory } from '@/lib/feature-page-stories';

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
}: {
  children: ReactNode;
  bg?: string;
}) {
  return (
    <section className="tl-feature-section" style={{ backgroundColor: bg }}>
      <div className="tl-feature-shell">{children}</div>
    </section>
  );
}

function Card({
  children,
  dark = false,
  style,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className ? `tl-feature-card ${className}` : 'tl-feature-card'}
      style={{
        backgroundColor: dark ? '#221D19' : C.white,
        color: dark ? C.white : C.ink,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : `1px solid ${C.creamDark}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        color: light ? C.teal : C.orange,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );
}

function Bullet({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: light ? C.teal : C.orange,
          flexShrink: 0,
          marginTop: 8,
        }}
      />
      <span
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: light ? 'rgba(254,252,250,0.82)' : C.ink,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function MetricChip({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 18,
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFF7EE',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1E0CF',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: dark ? 'rgba(254,252,250,0.68)' : C.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          marginTop: 6,
          color: dark ? C.white : C.ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function planAccent(name: string) {
  if (name === 'Momentum') return '#1D7A55';
  if (name === 'Engine') return C.teal;
  return C.orange;
}

function includesPlan(featurePlan: FeatureStory['includedIn'], planName: (typeof plans)[number]['name']) {
  const rank = { Launch: 0, Momentum: 1, Engine: 2 };
  return rank[planName] >= rank[featurePlan];
}

export default function FeatureStoryPage({ story }: { story: FeatureStory }) {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-feature-section { padding: 80px 24px; }
        .tl-feature-shell { max-width: 1180px; margin: 0 auto; }
        .tl-feature-card {
          border-radius: 28px;
          padding: 26px;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .tl-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(26, 22, 18, 0.08);
        }
        .tl-feature-fade { animation: tlFeatureFadeUp 0.65s ease both; }
        .tl-feature-delay-1 { animation-delay: 0.08s; }
        .tl-feature-delay-2 { animation-delay: 0.16s; }
        .tl-feature-delay-3 { animation-delay: 0.24s; }
        @keyframes tlFeatureFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .tl-feature-hero,
          .tl-feature-workflow,
          .tl-feature-closing { grid-template-columns: 1fr !important; }
          .tl-feature-levers { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 768px) {
          .tl-feature-section { padding: 64px 18px !important; }
          .tl-feature-hero-title {
            font-size: 42px !important;
            line-height: 1.03 !important;
            text-align: center !important;
            margin-inline: auto !important;
          }
          .tl-feature-body,
          .tl-feature-heading,
          .tl-feature-hero-copy,
          .tl-feature-closing-copy {
            text-align: center !important;
            margin-inline: auto !important;
          }
          .tl-feature-actions,
          .tl-feature-closing-actions { justify-content: center !important; }
          .tl-feature-levers,
          .tl-feature-tier-grid,
          .tl-feature-metrics,
          .tl-feature-panel-rows { grid-template-columns: 1fr !important; }
          .tl-feature-card:hover { transform: none !important; box-shadow: none !important; }
        }
      `}</style>

      <Section bg={C.ink}>
        <div
          className="tl-feature-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.02fr',
            gap: 28,
            alignItems: 'stretch',
          }}
        >
          <div className="tl-feature-fade tl-feature-hero-copy">
            <Eyebrow text={story.eyebrow} light />
            <h1
              className="tl-feature-hero-title"
              style={{
                fontSize: 62,
                lineHeight: 0.98,
                letterSpacing: '-0.045em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 680,
                marginBottom: 16,
              }}
            >
              {story.heroTitle}
            </h1>
            <p
              className="tl-feature-body"
              style={{
                fontSize: 18,
                lineHeight: 1.68,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 640,
                marginBottom: 26,
              }}
            >
              {story.heroSummary}
            </p>
            <div className="tl-feature-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PillButton text="Start with Momentum" href="/pricing" variant="primary" size="md" />
              <PillButton text="Book a demo" href="/demo" variant="ghost" size="md" />
            </div>
            <div
              className="tl-feature-metrics"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                marginTop: 28,
                maxWidth: 660,
              }}
            >
              {story.heroMetrics.map((metric) => (
                <MetricChip key={metric.label} label={metric.label} value={metric.value} dark />
              ))}
            </div>
          </div>

          <Card
            dark
            style={{
              background:
                'radial-gradient(circle at top left, rgba(68,217,161,0.16) 0%, rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.04) 100%)',
              display: 'grid',
              gap: 18,
            }}
          >
            <div className="tl-feature-fade tl-feature-delay-1">
              <Eyebrow text={story.spotlight.eyebrow} light />
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.04,
                  fontWeight: 800,
                  color: C.white,
                  maxWidth: 520,
                }}
              >
                {story.spotlight.title}
              </div>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.68,
                  color: 'rgba(254,252,250,0.78)',
                  marginTop: 12,
                  maxWidth: 520,
                }}
              >
                {story.spotlight.summary}
              </p>
            </div>

            <div className="tl-feature-fade tl-feature-delay-2" style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                {story.spotlight.chips.map((chip, index) => (
                  <div
                    key={chip}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 999,
                      backgroundColor: index === 0 ? 'rgba(232,86,24,0.14)' : 'rgba(255,255,255,0.06)',
                      color: index === 0 ? '#FFD5C3' : C.white,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
              {story.spotlight.rail.map((row, index) => (
                <div
                  key={row.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    borderRadius: 16,
                    padding: '12px 14px',
                    backgroundColor: index === 0 ? 'rgba(68,217,161,0.12)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(254,252,250,0.68)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>{row.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section bg={C.white}>
        <div className="tl-feature-heading tl-feature-fade" style={{ maxWidth: 760 }}>
          <Eyebrow text={story.leversEyebrow} />
          <h2 style={{ fontSize: 40, lineHeight: 1.06, fontWeight: 800, color: C.ink, marginBottom: 14 }}>{story.leversTitle}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.66, color: C.muted, maxWidth: 700 }}>{story.leversSummary}</p>
        </div>
        <div className="tl-feature-levers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, marginTop: 30 }}>
          {story.levers.map((lever, index) => (
            <Card key={lever.title} style={{ minHeight: 220 }} className={`tl-feature-fade tl-feature-delay-${Math.min(index + 1, 3)}`}>
              <div style={{ width: 56, height: 4, borderRadius: 999, background: 'linear-gradient(90deg, #E85618 0%, #44D9A1 100%)', marginBottom: 18 }} />
              <div style={{ fontSize: 24, lineHeight: 1.08, fontWeight: 800, color: C.ink, marginBottom: 12 }}>{lever.title}</div>
              <p style={{ fontSize: 15, lineHeight: 1.68, color: C.muted }}>{lever.summary}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section bg={C.creamDark}>
        <div
          className="tl-feature-workflow"
          style={{
            display: 'grid',
            gridTemplateColumns: '0.96fr 1.04fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <Card className="tl-feature-fade" style={{ display: 'grid', gap: 18 }}>
            <div className="tl-feature-heading">
              <Eyebrow text={story.workflowEyebrow} />
              <h2 style={{ fontSize: 36, lineHeight: 1.08, fontWeight: 800, color: C.ink, marginBottom: 12 }}>{story.workflowTitle}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.66, color: C.muted }}>{story.workflowSummary}</p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {story.workflowSteps.map((step) => (
                <Bullet key={step} text={step} />
              ))}
            </div>
          </Card>

          <Card className="tl-feature-fade tl-feature-delay-1" style={{ background: 'linear-gradient(180deg, #FFFDF9 0%, #FFF5E8 100%)', display: 'grid', gap: 16 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 999,
                backgroundColor: '#FFF1E5',
                color: C.orange,
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                alignSelf: 'flex-start',
              }}
            >
              {story.workflowPanelTitle}
            </div>

            <div className="tl-feature-panel-rows" style={{ display: 'grid', gap: 10 }}>
              {story.workflowPanelRows.map((row, index) => (
                <div
                  key={row.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    borderRadius: 18,
                    padding: '14px 16px',
                    border: '1px solid #EADFCF',
                    backgroundColor: index === 0 ? '#FFFFFF' : '#FFF9F3',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{row.value}</div>
                  </div>
                  <div style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: index === 0 ? '#FDE6D6' : '#F7EBDD' }} />
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: 18,
                padding: 16,
                backgroundColor: '#FFF',
                border: '1px solid #EADFCF',
                fontSize: 14,
                lineHeight: 1.65,
                color: C.muted,
              }}
            >
              {story.workflowPanelNote}
            </div>
          </Card>
        </div>
      </Section>

      <Section bg={C.white}>
        <div className="tl-feature-heading tl-feature-fade" style={{ maxWidth: 760 }}>
          <Eyebrow text="Tier fit" />
          <h2 style={{ fontSize: 40, lineHeight: 1.06, fontWeight: 800, color: C.ink, marginBottom: 14 }}>
            This page fits into the same Launch, Momentum, Engine ladder.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.66, color: C.muted }}>
            {story.planReason} {story.nextUnlock}
          </p>
        </div>

        <div className="tl-feature-tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginTop: 30 }}>
          {plans.map((plan, index) => {
            const available = includesPlan(story.includedIn, plan.name);
            const accent = planAccent(plan.name);
            return (
              <Card
                key={plan.name}
                className={`tl-feature-fade tl-feature-delay-${Math.min(index + 1, 3)}`}
                style={{
                  minHeight: 250,
                  backgroundColor: available ? '#FFFDF9' : '#FFFBF6',
                  borderColor: available ? '#E4D9C9' : '#EEE4D5',
                }}
              >
                <div style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, backgroundColor: available ? '#FFF1E5' : '#F5EFE7', color: accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {plan.badge}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, marginTop: 16 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>{plan.price}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{plan.cadence}</span>
                </div>
                <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 16, backgroundColor: available ? '#F0FBF5' : '#F8F2EB', color: available ? '#196C4B' : C.muted, fontSize: 13, fontWeight: 700 }}>
                  {available ? 'Included here' : `Unlocks after ${story.includedIn}`}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, marginTop: 14 }}>{plan.summary}</p>
              </Card>
            );
          })}

          <Card className="tl-feature-fade tl-feature-delay-3" dark style={{ minHeight: 250 }}>
            <div style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, backgroundColor: 'rgba(68,217,161,0.14)', color: C.teal, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {growthAdvisor.badge}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.white, marginTop: 16 }}>{growthAdvisor.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.white }}>{growthAdvisor.price}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(254,252,250,0.68)' }}>{growthAdvisor.cadence}</span>
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', color: C.teal, fontSize: 13, fontWeight: 700 }}>
              Strategy addition
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(254,252,250,0.78)', marginTop: 14 }}>
              Strategy, pricing guidance, and launch coaching can sit beside any plan when the operator wants more leverage.
            </p>
          </Card>
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '92px 24px' }}>
        <div className="tl-feature-closing" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div className="tl-feature-closing-copy">
            <Eyebrow text="Next move" light />
            <h2 style={{ fontSize: 44, lineHeight: 1.04, fontWeight: 800, marginBottom: 14, maxWidth: 680 }}>{story.closingTitle}</h2>
            <p style={{ fontSize: 18, lineHeight: 1.66, color: 'rgba(254,252,250,0.82)', maxWidth: 660 }}>{story.closingSummary}</p>
          </div>
          <div className="tl-feature-closing-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
            <PillButton text="Book a demo" href="/demo" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
