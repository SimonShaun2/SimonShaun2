import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import PillButton from '@/components/pill-button';

const C = {
  cream: '#F8F3EC',
  creamSoft: '#FFF8F1',
  line: '#E8DDD1',
  ink: '#191510',
  muted: '#776A5F',
  orange: '#E85618',
  teal: '#44D9A1',
  white: '#FEFCFA',
  inkSoft: '#221D19',
};

export const metadata: Metadata = {
  title: 'TrayLoop Design Partnership',
  description:
    'Work directly with TrayLoop to shape the next generation of direct catering software before the broader market sees it.',
};

function Section({
  children,
  background = 'transparent',
  className,
  style,
}: {
  children: React.ReactNode;
  background?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={className}
      style={{
        background,
        padding: '88px 24px',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children, color = C.orange }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        backgroundColor: color === C.orange ? '#FFF0E6' : 'rgba(68,217,161,0.12)',
        color,
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
  className,
  style,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: dark ? C.inkSoft : C.white,
        color: dark ? C.white : C.ink,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : `1px solid ${C.line}`,
        borderRadius: 30,
        padding: 28,
        boxShadow: dark ? 'none' : '0 20px 60px rgba(25, 21, 16, 0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bullet({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: light ? C.teal : C.orange,
          marginTop: 8,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: light ? 'rgba(254,252,250,0.82)' : C.ink,
        }}
      >
        {text}
      </span>
    </div>
  );
}

const partnerBenefits = [
  'Direct access to the TrayLoop product team during the build cycle',
  'Priority implementation for the operational workflows that matter most to your team',
  'Private previews of new direct-ordering, repeat-revenue, and retention features',
  'Hands-on design reviews so the product reflects how real catering teams actually work',
];

const partnerFit = [
  'You already care about direct catering, repeat revenue, and operational polish',
  'You can give honest feedback from a live restaurant or multi-unit operator perspective',
  'You want a tighter loop with the team than a normal software customer relationship',
];

const partnershipArc = [
  {
    step: 'Month 1',
    title: 'Audit the current setup',
    detail:
      'We review your storefront, intake rules, follow-up flow, and the friction points that slow down direct catering.',
  },
  {
    step: 'Month 2',
    title: 'Ship the highest-leverage improvements',
    detail:
      'We focus on the screens, logic, and conversion blockers that will change operator behavior the fastest.',
  },
  {
    step: 'Month 3',
    title: 'Turn feedback into a durable operating system',
    detail:
      'The result is not a one-off mockup. It is a sharper product and a stronger growth system your team can keep using.',
  },
];

const collaborationLanes = [
  {
    title: 'Operator sessions',
    body: 'Short working sessions with the people who actually manage orders, deposits, customer follow-up, and launch readiness.',
  },
  {
    title: 'Design reviews',
    body: 'We refine information hierarchy, workflows, and conversion surfaces so the product feels expensive in use, not just in screenshots.',
  },
  {
    title: 'Fast iteration',
    body: 'You see the direction early, react quickly, and help us make sharper product decisions before the wider rollout.',
  },
];

export default function DesignPartnershipPage() {
  return (
    <main style={{ backgroundColor: C.cream }}>
      <style>{`
        .tl-partnership-fade {
          animation: tlPartnershipFade 0.7s ease both;
        }
        .tl-partnership-delay-1 { animation-delay: 0.08s; }
        .tl-partnership-delay-2 { animation-delay: 0.16s; }
        .tl-partnership-delay-3 { animation-delay: 0.24s; }
        @keyframes tlPartnershipFade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tl-partnership-hero {
          display: grid;
          grid-template-columns: minmax(0, 0.94fr) minmax(420px, 1.06fr);
          gap: 28px;
          align-items: stretch;
        }
        .tl-partnership-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .tl-partnership-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .tl-partnership-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }
        @media (max-width: 1040px) {
          .tl-partnership-hero,
          .tl-partnership-grid-3,
          .tl-partnership-grid-2,
          .tl-partnership-final {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .tl-partnership-section {
            padding: 64px 18px !important;
          }
          .tl-partnership-section > div {
            max-width: 620px !important;
            margin: 0 auto !important;
          }
          .tl-partnership-hero-title {
            font-size: 46px !important;
            line-height: 1.01 !important;
          }
          .tl-partnership-title {
            font-size: 34px !important;
            line-height: 1.08 !important;
          }
          .tl-partnership-copy {
            font-size: 16px !important;
            line-height: 1.68 !important;
          }
          .tl-partnership-actions {
            justify-content: center !important;
          }
          .tl-partnership-copy-block,
          .tl-partnership-intro,
          .tl-partnership-final-copy {
            text-align: center !important;
            margin-inline: auto !important;
          }
          .tl-partnership-hero-visual {
            min-height: 460px !important;
          }
          .tl-partnership-hero-overlay {
            padding: 20px !important;
          }
          .tl-partnership-stat-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Section
        background={C.ink}
        className="tl-partnership-section"
        style={{ paddingTop: 72, paddingBottom: 72 }}
      >
        <div className="tl-partnership-hero">
          <div className="tl-partnership-fade tl-partnership-copy-block" style={{ display: 'grid', alignContent: 'center' }}>
            <Eyebrow color={C.teal}>Design partnership</Eyebrow>
            <h1
              className="tl-partnership-hero-title"
              style={{
                fontSize: 68,
                lineHeight: 0.95,
                letterSpacing: '-0.055em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 620,
                marginTop: 22,
              }}
            >
              Help shape the future of direct catering.
            </h1>
            <p
              className="tl-partnership-copy"
              style={{
                fontSize: 19,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.8)',
                maxWidth: 620,
                marginTop: 20,
              }}
            >
              We are opening a small design-partnership cohort for operators who want direct access to the TrayLoop team
              while we sharpen the next generation of storefront, retention, and revenue workflows.
            </p>

            <div className="tl-partnership-actions">
              <PillButton text="Apply for the cohort" href="/demo" variant="primary" size="md" />
              <PillButton
                text="Email the team"
                href="mailto:hello@trayloophq.com?subject=TrayLoop%20Design%20Partnership"
                variant="ghost"
                size="md"
              />
            </div>
          </div>

          <div className="tl-partnership-fade tl-partnership-delay-1">
            <div
              className="tl-partnership-hero-visual"
              style={{
                position: 'relative',
                minHeight: 640,
                overflow: 'hidden',
                borderRadius: 34,
                border: '1px solid rgba(254,252,250,0.08)',
                boxShadow: '0 32px 90px rgba(0,0,0,0.24)',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&h=1800&fit=crop&q=80"
                alt="Restaurant operators reviewing catering workflow details together"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(25,21,16,0.12) 0%, rgba(25,21,16,0.32) 45%, rgba(25,21,16,0.92) 100%)',
                }}
              />
              <div
                className="tl-partnership-hero-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="tl-partnership-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    ['Cohort size', '3-5 partners'],
                    ['Working rhythm', 'Bi-weekly'],
                    ['Focus', 'Live revenue flows'],
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
                      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: C.white }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    maxWidth: 460,
                    padding: 20,
                    borderRadius: 24,
                    backgroundColor: 'rgba(25,21,16,0.7)',
                    border: '1px solid rgba(254,252,250,0.12)',
                    backdropFilter: 'blur(14px)',
                    color: C.white,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: C.teal,
                    }}
                  >
                    What we are building with you
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
                    Direct catering that feels premium to the merchant, the team, and the customer.
                  </div>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: 'rgba(254,252,250,0.78)' }}>
                    Storefront conversion, repeat revenue, operator workflow continuity, and sharper retention surfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background={C.white} className="tl-partnership-section">
        <div className="tl-partnership-intro tl-partnership-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>Why this exists</Eyebrow>
          <h2
            className="tl-partnership-title"
            style={{ fontSize: 42, lineHeight: 1.04, fontWeight: 800, color: C.ink, marginTop: 18 }}
          >
            We want a tighter feedback loop than a normal customer relationship.
          </h2>
          <p className="tl-partnership-copy" style={{ fontSize: 17, lineHeight: 1.7, color: C.muted, marginTop: 16 }}>
            Design partners help us make better product decisions earlier. Instead of guessing what operators need after a
            launch, we build the next layer of TrayLoop with real teams who care deeply about direct catering revenue.
          </p>
        </div>

        <div className="tl-partnership-grid-2" style={{ marginTop: 34 }}>
          <Surface className="tl-partnership-fade tl-partnership-delay-1">
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.orange }}>
              What you get
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {partnerBenefits.map((item) => (
                <Bullet key={item} text={item} />
              ))}
            </div>
          </Surface>

          <Surface className="tl-partnership-fade tl-partnership-delay-2" dark>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.teal }}>
              Who it is for
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {partnerFit.map((item) => (
                <Bullet key={item} text={item} light />
              ))}
            </div>
          </Surface>
        </div>
      </Section>

      <Section background={C.creamSoft} className="tl-partnership-section">
        <div className="tl-partnership-intro tl-partnership-fade" style={{ maxWidth: 760 }}>
          <Eyebrow>The arc</Eyebrow>
          <h2
            className="tl-partnership-title"
            style={{ fontSize: 42, lineHeight: 1.04, fontWeight: 800, color: C.ink, marginTop: 18 }}
          >
            A clear 90-day collaboration, not an open-ended feedback request.
          </h2>
          <p className="tl-partnership-copy" style={{ fontSize: 17, lineHeight: 1.7, color: C.muted, marginTop: 16 }}>
            We use the design partnership to move through diagnosis, iteration, and refinement with enough speed to matter
            and enough structure to stay useful for your team.
          </p>
        </div>

        <div className="tl-partnership-grid-3" style={{ marginTop: 34 }}>
          {partnershipArc.map((item, index) => (
            <Surface key={item.step} className={`tl-partnership-fade tl-partnership-delay-${index + 1}`} style={{ minHeight: 250 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.orange }}>
                {item.step}
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.08, fontWeight: 800, color: C.ink, marginTop: 16 }}>{item.title}</div>
              <p style={{ fontSize: 16, lineHeight: 1.68, color: C.muted, marginTop: 14 }}>{item.detail}</p>
            </Surface>
          ))}
        </div>
      </Section>

      <Section background={C.white} className="tl-partnership-section">
        <div className="tl-partnership-grid-3">
          {collaborationLanes.map((lane, index) => (
            <Surface key={lane.title} className={`tl-partnership-fade tl-partnership-delay-${index + 1}`}>
              <div style={{ width: 44, height: 4, borderRadius: 999, background: 'linear-gradient(90deg, #E85618 0%, #44D9A1 100%)' }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 16 }}>{lane.title}</div>
              <p style={{ fontSize: 16, lineHeight: 1.68, color: C.muted, marginTop: 12 }}>{lane.body}</p>
            </Surface>
          ))}
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '88px 24px' }}>
        <div
          className="tl-partnership-final"
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div className="tl-partnership-final-copy" style={{ maxWidth: 700 }}>
            <Eyebrow color={C.teal}>Apply</Eyebrow>
            <h2 style={{ fontSize: 44, lineHeight: 1.03, fontWeight: 800, marginTop: 18 }}>
              If you want a real hand in shaping TrayLoop, this is the page to use.
            </h2>
            <p
              className="tl-partnership-copy"
              style={{ fontSize: 18, lineHeight: 1.68, color: 'rgba(254,252,250,0.8)', marginTop: 14 }}
            >
              We are keeping the cohort intentionally small so we can move fast, respond directly, and build with care.
            </p>
          </div>

          <div className="tl-partnership-actions" style={{ justifyContent: 'flex-end', marginTop: 0 }}>
            <PillButton text="Apply for the cohort" href="/demo" variant="primary" size="md" />
            <PillButton
              text="Send a note"
              href="mailto:hello@trayloophq.com?subject=TrayLoop%20Design%20Partnership"
              variant="ghost"
              size="md"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
