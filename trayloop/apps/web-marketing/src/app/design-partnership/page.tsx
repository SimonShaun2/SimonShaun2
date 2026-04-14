import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import PillButton from '@/components/pill-button';

const palette = {
  cream: '#F8F3EC',
  creamSoft: '#FFF8F1',
  paper: '#FEFCFA',
  ink: '#191510',
  inkSoft: '#221D19',
  muted: '#6E6156',
  line: '#E7DBCF',
  orange: '#E85618',
  orangeSoft: '#FFF0E6',
  teal: '#44D9A1',
  tealSoft: 'rgba(68, 217, 161, 0.14)',
};

const applyHref = 'mailto:info@trayloophq.com?subject=TrayLoop%20Design%20Partnership';

export const metadata: Metadata = {
  title: 'TrayLoop Design Partnership',
  description:
    'Apply for TrayLoop’s Design Partnership Program and help shape an AI-driven catering revenue system built to replace commissions, manual follow-up, and one-off order dependence.',
};

function Section({
  children,
  background = 'transparent',
  style,
  className,
}: {
  children: React.ReactNode;
  background?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background,
        padding: '88px 24px',
        borderTop: background === palette.paper ? `1px solid ${palette.line}` : 'none',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 14px',
        borderRadius: 999,
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : palette.orangeSoft,
        color: dark ? palette.teal : palette.orange,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
}

function Surface({
  children,
  dark = false,
  style,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: dark ? palette.inkSoft : palette.paper,
        color: dark ? palette.paper : palette.ink,
        border: dark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${palette.line}`,
        borderRadius: 28,
        padding: 28,
        boxShadow: dark ? 'none' : '0 20px 60px rgba(25, 21, 16, 0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bullet({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: light ? palette.teal : palette.orange,
          marginTop: 8,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: light ? 'rgba(254,252,250,0.84)' : palette.ink,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const problemPoints = [
  'Marketplace commissions shave margin off the biggest orders on your calendar.',
  'The customer relationship lives with the platform, not with your team.',
  'One-off catering orders land, get fulfilled, and disappear with no retention system behind them.',
  'Manual follow-up means missed repeat opportunities, missed reorders, and missed revenue.',
];

const solutionCards = [
  {
    title: 'Direct ordering infrastructure',
    body: 'Own the storefront, the ordering flow, and the customer relationship so more revenue stays in-house.',
  },
  {
    title: 'Automated retention system',
    body: 'Bring past catering customers back with reorder prompts, reminders, and follow-up logic that runs without manual chasing.',
  },
  {
    title: 'Customer history and reorder context',
    body: 'Keep account history, event context, and repeat behavior in one operating system instead of scattered notes and inbox threads.',
  },
  {
    title: 'AI-powered follow-up engine',
    body: 'Surface who is likely to reorder, who is cooling off, and what revenue move should happen next.',
  },
];

const valueStack = [
  {
    title: 'Done-for-you setup',
    body: 'We stand up the ordering flow, revenue rules, and operational structure so your team gets to value fast.',
    payoff: 'Faster launch. Less internal drag. Revenue sooner.',
  },
  {
    title: 'Direct storefront ownership',
    body: 'Your restaurant gets a branded catering flow designed to convert direct demand instead of leaking it to third parties.',
    payoff: 'Better margins. Better trust. Better customer ownership.',
  },
  {
    title: 'Automated reorder and retention engine',
    body: 'TrayLoop helps turn fulfilled orders into future revenue with post-order follow-up, repeat prompts, and reactivation logic.',
    payoff: 'More second and third orders with less manual work.',
  },
  {
    title: 'Early access to AI revenue workflows',
    body: 'Get priority access to AI-assisted follow-up, re-engagement, and operator recommendations before broader rollout.',
    payoff: 'More recovered revenue. Fewer missed opportunities.',
  },
  {
    title: 'Direct line to the product team',
    body: 'Your feedback shapes the product while the workflows are still being refined, not after the roadmap is already locked.',
    payoff: 'A stronger system that fits real catering operations.',
  },
];

const requirements = [
  '$5,000+/month in catering revenue today',
  'A serious intention to grow direct catering, not just experiment with another tool',
  'A willingness to give sharp, practical feedback from a real operating environment',
];

const roiCards = [
  {
    value: '$500-$2,000+',
    label: 'per month from one repeat client',
    body: 'A single account that reorders consistently can change the economics of your catering channel.',
  },
  {
    value: '$2,250/mo',
    label: 'from recovering 3 lost reorder accounts',
    body: 'Three past customers reactivated at $750/month each is meaningful revenue recovered fast.',
  },
  {
    value: 'Immediate margin gain',
    label: 'from moving orders off marketplaces',
    body: 'When the commission disappears, you keep more of every large order without increasing volume.',
  },
];

const proofCards = [
  {
    quote:
      'We did not need another dashboard. We needed a system that turned fulfilled catering into the next order.',
    source: 'Multi-unit operator in early rollout',
  },
  {
    quote:
      'The biggest shift was ownership. Once the customer relationship was ours, the economics got better fast.',
    source: 'Independent restaurant group using direct catering',
  },
  {
    quote:
      'We were already doing the volume. The leak was what happened after the event. That is what TrayLoop started to fix.',
    source: 'Operator managing repeat office accounts',
  },
];

export default function DesignPartnershipPage() {
  return (
    <main style={{ backgroundColor: palette.cream, color: palette.ink }}>
      <style>{`
        .dp-fade {
          animation: dpFade 0.7s ease both;
        }
        .dp-delay-1 { animation-delay: 0.08s; }
        .dp-delay-2 { animation-delay: 0.16s; }
        .dp-delay-3 { animation-delay: 0.24s; }
        @keyframes dpFade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dp-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
          gap: 28px;
          align-items: stretch;
        }
        .dp-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .dp-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .dp-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }
        .dp-actions a {
          text-align: center;
        }
        @media (max-width: 1040px) {
          .dp-hero,
          .dp-grid-2,
          .dp-grid-3,
          .dp-final {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dp-section {
            padding: 56px 16px !important;
          }
          .dp-section > div {
            max-width: 560px !important;
            margin: 0 auto !important;
          }
          .dp-hero-copy,
          .dp-intro,
          .dp-final-copy {
            text-align: center !important;
            margin-inline: auto !important;
          }
          .dp-hero-title {
            font-size: 44px !important;
            line-height: 0.98 !important;
            letter-spacing: -0.05em !important;
          }
          .dp-title {
            font-size: 32px !important;
            line-height: 1.08 !important;
          }
          .dp-copy {
            font-size: 15px !important;
            line-height: 1.72 !important;
          }
          .dp-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: center !important;
          }
          .dp-actions a {
            width: 100% !important;
          }
          .dp-hero-visual {
            min-height: 420px !important;
            max-width: 560px !important;
            margin: 0 auto !important;
          }
          .dp-stat-row {
            grid-template-columns: 1fr !important;
          }
          .dp-final-copy h2 {
            font-size: 34px !important;
            line-height: 1.08 !important;
          }
        }
      `}</style>

      <Section
        background={palette.ink}
        className="dp-section"
        style={{ paddingTop: 72, paddingBottom: 72, borderTop: 'none' }}
      >
        <div className="dp-hero">
          <div className="dp-fade dp-hero-copy" style={{ display: 'grid', alignContent: 'center' }}>
            <Eyebrow dark>Design partnership program</Eyebrow>
            <h1
              className="dp-hero-title"
              style={{
                fontSize: 70,
                lineHeight: 0.94,
                letterSpacing: '-0.06em',
                color: palette.paper,
                fontWeight: 800,
                maxWidth: 650,
                marginTop: 22,
              }}
            >
              Stop renting your catering revenue. Start owning it.
            </h1>
            <p
              className="dp-copy"
              style={{
                fontSize: 20,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
                marginTop: 18,
              }}
            >
              TrayLoop is an AI-driven catering revenue system that turns one-off orders into predictable recurring
              revenue, without marketplaces, commissions, or manual follow-up.
            </p>
            <p
              className="dp-copy"
              style={{
                fontSize: 17,
                lineHeight: 1.72,
                color: 'rgba(254,252,250,0.68)',
                maxWidth: 620,
                marginTop: 14,
              }}
            >
              You do not need more leads you cannot keep. You need a system that captures demand, brings customers back,
              and grows revenue you actually own.
            </p>

            <div className="dp-actions">
              <PillButton text="Apply for Design Partnership" href={applyHref} variant="primary" size="md" />
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(254,252,250,0.68)',
                letterSpacing: '0.02em',
              }}
            >
              Only 10-15 operators will be accepted in this round.
            </div>
          </div>

          <div className="dp-fade dp-delay-1">
            <div
              className="dp-hero-visual"
              style={{
                position: 'relative',
                minHeight: 640,
                overflow: 'hidden',
                borderRadius: 34,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 90px rgba(0,0,0,0.24)',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1600&h=1800&fit=crop&q=80"
                alt="Restaurant operators reviewing revenue and catering workflow performance"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(25,21,16,0.14) 0%, rgba(25,21,16,0.4) 48%, rgba(25,21,16,0.94) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="dp-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    ['Partner cap', '10-15'],
                    ['Best fit', '$5k-$100k+/mo'],
                    ['Focus', 'Recurring revenue'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 18,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(254,252,250,0.08)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(254,252,250,0.72)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 800,
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: palette.paper }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    maxWidth: 470,
                    padding: 22,
                    borderRadius: 24,
                    backgroundColor: 'rgba(25,21,16,0.72)',
                    border: '1px solid rgba(254,252,250,0.12)',
                    backdropFilter: 'blur(14px)',
                    color: palette.paper,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: palette.teal,
                    }}
                  >
                    Built for operators
                  </div>
                  <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, lineHeight: 1.08 }}>
                    More owned customers. More repeat orders. Less dependence on marketplaces.
                  </div>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: 'rgba(254,252,250,0.78)' }}>
                    TrayLoop is not software to manage transactions. It is the revenue system behind a stronger direct
                    catering channel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background={palette.paper} className="dp-section">
        <div className="dp-intro dp-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>Why operators apply</Eyebrow>
          <h2 className="dp-title" style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
            Marketplace growth looks good on paper until you count what it actually costs.
          </h2>
          <p className="dp-copy" style={{ fontSize: 17, lineHeight: 1.72, color: palette.muted, marginTop: 16 }}>
            Most catering teams are doing real volume already. The problem is what happens after the order lands and who
            controls the customer relationship after it is fulfilled.
          </p>
        </div>

        <div className="dp-grid-2" style={{ marginTop: 34 }}>
          <Surface className="dp-fade dp-delay-1">
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange }}>
              The pain
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {problemPoints.map((item) => (
                <Bullet key={item}>{item}</Bullet>
              ))}
            </div>
          </Surface>

          <Surface className="dp-fade dp-delay-2" dark>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.teal }}>
              The cost
            </div>
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div style={{ fontSize: 34, lineHeight: 1.02, fontWeight: 800 }}>You do not have a catering system. You have transactions.</div>
              <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(254,252,250,0.8)' }}>
                Random inbound demand, manual follow-up, and third-party dependence do not create a predictable revenue
                channel. They create a treadmill.
              </p>
            </div>
          </Surface>
        </div>

        <div className="dp-actions" style={{ justifyContent: 'center' }}>
          <PillButton text="Apply for Design Partnership" href={applyHref} variant="primary" size="md" />
        </div>
      </Section>

      <Section background={palette.creamSoft} className="dp-section">
        <div className="dp-intro dp-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>The reframe</Eyebrow>
          <h2 className="dp-title" style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
            Catering should be a predictable revenue channel, not a random stream of one-off orders.
          </h2>
          <p className="dp-copy" style={{ fontSize: 17, lineHeight: 1.72, color: palette.muted, marginTop: 16 }}>
            The right system captures demand directly, retains the relationship, and creates repeat revenue without your
            team manually piecing it together after every event.
          </p>
        </div>

        <div className="dp-grid-2" style={{ marginTop: 34 }}>
          {solutionCards.map((card, index) => (
            <Surface key={card.title} className={`dp-fade dp-delay-${(index % 3) + 1}`}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange }}>
                Revenue system
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 800, marginTop: 14 }}>{card.title}</div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: palette.muted, marginTop: 12 }}>{card.body}</p>
            </Surface>
          ))}
        </div>
      </Section>

      <Section background={palette.paper} className="dp-section">
        <div className="dp-grid-2" style={{ alignItems: 'start' }}>
          <div className="dp-fade">
            <Eyebrow>What this is</Eyebrow>
            <h2 className="dp-title" style={{ fontSize: 42, lineHeight: 1.04, fontWeight: 800, marginTop: 18 }}>
              A limited partnership for operators who want direct influence on the system before broad scale.
            </h2>
            <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
              <Bullet>This is not a free trial.</Bullet>
              <Bullet>This is not a beta you click through casually.</Bullet>
              <Bullet>This is early access with white-glove implementation and direct product influence.</Bullet>
            </div>
          </div>

          <Surface className="dp-fade dp-delay-1" dark>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.teal }}>
              Why we are keeping it small
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.08, fontWeight: 800, marginTop: 14 }}>
              We only want partners who are serious about building a stronger catering channel.
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(254,252,250,0.8)', marginTop: 12 }}>
              Small cohort. Direct line. Fast iteration. Real implementation support. That is what makes this valuable.
            </p>
          </Surface>
        </div>
      </Section>

      <Section background={palette.creamSoft} className="dp-section">
        <div className="dp-intro dp-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>What you get</Eyebrow>
          <h2 className="dp-title" style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
            High-leverage support tied directly to revenue growth and operational leverage.
          </h2>
        </div>

        <div className="dp-grid-3" style={{ marginTop: 34 }}>
          {valueStack.map((item, index) => (
            <Surface key={item.title} className={`dp-fade dp-delay-${(index % 3) + 1}`} style={{ minHeight: 272 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange }}>
                Included
              </div>
              <div style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 800, marginTop: 14 }}>{item.title}</div>
              <p style={{ fontSize: 16, lineHeight: 1.68, color: palette.muted, marginTop: 12 }}>{item.body}</p>
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: `1px solid ${palette.line}`,
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                {item.payoff}
              </div>
            </Surface>
          ))}
        </div>

        <div className="dp-actions" style={{ justifyContent: 'center' }}>
          <PillButton text="Apply for Design Partnership" href={applyHref} variant="primary" size="md" />
        </div>
      </Section>

      <Section background={palette.paper} className="dp-section">
        <div className="dp-grid-2">
          <Surface className="dp-fade">
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange }}>
              What is required
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {requirements.map((item) => (
                <Bullet key={item}>{item}</Bullet>
              ))}
            </div>
          </Surface>

          <Surface className="dp-fade dp-delay-1" dark>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.teal }}>
              Why the filter matters
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.08, fontWeight: 800, marginTop: 14 }}>
              The best feedback comes from operators who already have real revenue at stake.
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(254,252,250,0.8)', marginTop: 12 }}>
              We are not looking for passive trial users. We are looking for serious operators who care about building a
              stronger, more owned catering channel.
            </p>
          </Surface>
        </div>
      </Section>

      <Section background={palette.creamSoft} className="dp-section">
        <div className="dp-intro dp-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>ROI</Eyebrow>
          <h2 className="dp-title" style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
            TrayLoop does not need magic to pay for itself. It only needs to recover revenue you are already losing.
          </h2>
        </div>

        <div className="dp-grid-3" style={{ marginTop: 34 }}>
          {roiCards.map((item, index) => (
            <Surface key={item.value} className={`dp-fade dp-delay-${index + 1}`} dark={index === 1}>
              <div style={{ fontSize: 38, lineHeight: 1, fontWeight: 800, color: index === 1 ? palette.teal : palette.ink }}>
                {item.value}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.55,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 800,
                  color: index === 1 ? 'rgba(254,252,250,0.72)' : palette.orange,
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: index === 1 ? 'rgba(254,252,250,0.8)' : palette.muted,
                }}
              >
                {item.body}
              </p>
            </Surface>
          ))}
        </div>
      </Section>

      <Section background={palette.paper} className="dp-section">
        <div className="dp-intro dp-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>Proof</Eyebrow>
          <h2 className="dp-title" style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
            Real operators do not need more software. They need a stronger revenue system.
          </h2>
        </div>

        <div className="dp-grid-3" style={{ marginTop: 34 }}>
          {proofCards.map((item, index) => (
            <Surface key={item.source} className={`dp-fade dp-delay-${index + 1}`}>
              <div style={{ fontSize: 24, lineHeight: 1.38, fontWeight: 700 }}>"{item.quote}"</div>
              <div style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6, color: palette.muted, fontWeight: 700 }}>{item.source}</div>
            </Surface>
          ))}
        </div>
      </Section>

      <Section background={palette.ink} className="dp-section" style={{ borderTop: 'none' }}>
        <div className="dp-final" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div className="dp-final-copy" style={{ maxWidth: 760 }}>
            <Eyebrow dark>Last call</Eyebrow>
            <h2 style={{ fontSize: 46, lineHeight: 1.02, fontWeight: 800, color: palette.paper, marginTop: 18 }}>
              We are accepting 10-15 partners. Then this round closes.
            </h2>
            <p className="dp-copy" style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(254,252,250,0.8)', marginTop: 14 }}>
              If you want to own more of your catering revenue, reduce dependence on third parties, and help shape the
              system before broad rollout, this is the moment to apply.
            </p>
          </div>

          <div className="dp-actions" style={{ justifyContent: 'flex-end', marginTop: 0 }}>
            <PillButton text="Apply Now" href={applyHref} variant="primary" size="md" />
          </div>
        </div>
      </Section>
    </main>
  );
}
