'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import PillButton from '@/components/pill-button';
import { howItWorksSteps } from '@/lib/marketing-story';

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
    <div style={{ maxWidth: 780 }}>
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

function MockSurface({
  title,
  label,
  accent,
  dark = false,
  rows,
}: {
  title: string;
  label: string;
  accent: string;
  dark?: boolean;
  rows: string[];
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: dark ? '1px solid rgba(254,252,250,0.08)' : '1px solid #E8DDCE',
        background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)' : 'linear-gradient(180deg, #FFFDF9 0%, #FFF4E7 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderBottom: dark ? '1px solid rgba(254,252,250,0.08)' : '1px solid #EADCC9',
          backgroundColor: dark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.55)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#F97316' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#F59E0B' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#22C55E' }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: dark ? 'rgba(254,252,250,0.72)' : C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
      </div>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {title}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: dark ? C.white : C.ink, marginTop: 6 }}>
              Direct catering, simplified.
            </div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: dark ? 'rgba(68,217,161,0.12)' : 'rgba(232,86,24,0.12)',
              border: dark ? '1px solid rgba(68,217,161,0.18)' : '1px solid rgba(232,86,24,0.14)',
            }}
          />
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map((row, index) => (
            <div
              key={row}
              style={{
                display: 'grid',
                gridTemplateColumns: '18px 1fr',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: index === rows.length - 1 ? accent : dark ? 'rgba(254,252,250,0.12)' : '#F6E9D9',
                  color: index === rows.length - 1 ? C.white : accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </div>
              <div style={{ height: 8, borderRadius: 999, background: index === rows.length - 1 ? accent : dark ? 'rgba(254,252,250,0.16)' : '#E6D6C2' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroCanvas() {
  return (
    <div
      className="tl-how-hero-canvas"
      style={{
        position: 'relative',
        minHeight: 620,
        borderRadius: 34,
        overflow: 'hidden',
        border: '1px solid rgba(254,252,250,0.1)',
        boxShadow: '0 26px 80px rgba(0, 0, 0, 0.24)',
        backgroundColor: '#2A2520',
      }}
    >
      <Image
        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&h=1400&fit=crop&q=80"
        alt="Team planning orders on a laptop"
        fill
        priority
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(25,21,16,0.06) 0%, rgba(25,21,16,0.2) 40%, rgba(25,21,16,0.9) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: 24,
          display: 'grid',
          alignContent: 'space-between',
          color: C.white,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['Launch', 'Momentum', 'Engine'].map((chip, index) => (
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
            backgroundColor: 'rgba(25,21,16,0.72)',
            border: '1px solid rgba(254,252,250,0.12)',
            backdropFilter: 'blur(14px)',
            maxWidth: 430,
          }}
        >
          <div style={{ fontSize: 12, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            What the workflow looks like
          </div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>The storefront, the order, and the follow up all move together.</div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(254,252,250,0.78)' }}>
            TrayLoop keeps the operator in one loop instead of sending the team across disconnected tools.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPanel({
  step,
  dark = false,
  reverse = false,
}: {
  step: (typeof howItWorksSteps)[number];
  dark?: boolean;
  reverse?: boolean;
}) {
  const rows =
    step.number === '01'
      ? ['Choose tier', 'Set storefront rules', 'Go live']
      : step.number === '02'
        ? ['Brand', 'Menu', 'Minimums']
        : step.number === '03'
          ? ['Ticket arrives', 'Kitchen sees the details', 'Deposit stays visible']
          : ['Recurring orders', 'Upsells', 'AI follow up'];

  const accent = step.number === '01' ? C.orange : step.number === '02' ? '#1D7A55' : C.teal;

  return (
    <div
      className="tl-how-step"
      style={{
        display: 'grid',
        gridTemplateColumns: reverse ? '1fr 1.05fr' : '1.05fr 1fr',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      <Card className="tl-how-step-copy" dark={dark} style={{ display: 'grid', gap: 16, minHeight: 320, color: dark ? C.white : C.ink }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            backgroundColor: dark ? 'rgba(68,217,161,0.14)' : '#FFF0E6',
            color: accent,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {step.number}
        </div>
        <div>
          <h3 style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 800, marginBottom: 10 }}>{step.title}</h3>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: dark ? 'rgba(254,252,250,0.78)' : C.muted }}>
            {step.summary}
          </p>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {step.bullets.slice(0, 2).map((bullet) => (
            <Bullet key={bullet} text={bullet} light={dark} />
          ))}
        </div>
      </Card>

      <Card
        className="tl-how-step-preview"
        dark={dark && step.number === '04'}
        style={{
          display: 'grid',
          gap: 16,
          background:
            step.number === '01'
              ? 'linear-gradient(180deg, #FFFDF9 0%, #FFF4E7 100%)'
              : step.number === '02'
                ? 'linear-gradient(180deg, #FFFFFF 0%, #F3FBF7 100%)'
                : step.number === '03'
                  ? 'linear-gradient(180deg, #FFFDF9 0%, #FFF2E8 100%)'
                  : 'linear-gradient(180deg, #221D19 0%, #191510 100%)',
          color: step.number === '04' ? C.white : C.ink,
        }}
      >
        {step.number === '03' ? (
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 240,
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=900&fit=crop&q=80"
              alt="Catering ticket on a kitchen counter"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(25,21,16,0.12) 0%, rgba(25,21,16,0.82) 100%)',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'grid', alignContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(254,252,250,0.12)',
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Order ticket
                </div>
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(68,217,161,0.14)',
                    color: C.teal,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Deposit collected
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: 'rgba(25,21,16,0.72)',
                  border: '1px solid rgba(254,252,250,0.1)',
                  color: C.white,
                  maxWidth: 360,
                }}
              >
                <div style={{ fontSize: 12, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Merchant view
                </div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>One order record, ready for action.</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(254,252,250,0.76)' }}>
                  The ticket, the customer, and the kitchen all see the same details.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <MockSurface
            title={step.number === '01' ? 'Setup' : step.number === '02' ? 'Storefront' : 'Retention'}
            label={step.number === '04' ? 'Engine loop' : 'Workflow view'}
            accent={accent}
            dark={step.number === '04'}
            rows={rows}
          />
        )}
      </Card>
    </div>
  );
}

function SurfaceCard({
  title,
  bullets,
  dark = false,
}: {
  title: string;
  bullets: string[];
  dark?: boolean;
}) {
  return (
    <Card dark={dark} style={{ display: 'grid', gap: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: dark ? C.teal : C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {bullets.map((bullet) => (
          <Bullet key={bullet} text={bullet} light={dark} />
        ))}
      </div>
    </Card>
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
        @media (max-width: 1024px) {
          .tl-how-hero,
          .tl-how-step {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 960px) {
          .tl-how-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .tl-how-section {
            padding: 64px 18px !important;
          }
          .tl-how-section > div {
            max-width: 560px !important;
            margin: 0 auto !important;
          }
          .tl-how-hero-title {
            font-size: 42px !important;
            line-height: 1.02 !important;
          }
          .tl-how-section-title {
            font-size: 32px !important;
            line-height: 1.08 !important;
          }
          .tl-how-body-copy {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }
          .tl-how-hero-canvas {
            min-height: 420px !important;
          }
          .tl-how-step {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .tl-how-step-copy {
            order: 1 !important;
            min-height: auto !important;
          }
          .tl-how-step-preview {
            order: 2 !important;
          }
          .tl-how-feature-grid {
            max-width: 560px !important;
            margin-inline: auto !important;
          }
          .tl-how-hero-copy,
          .tl-how-heading-block,
          .tl-how-closing > div:first-child {
            text-align: center !important;
            margin-inline: auto !important;
          }
          .tl-how-actions,
          .tl-how-closing-actions {
            justify-content: center !important;
          }
          .tl-how-closing {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Section bg={C.ink} style={{ paddingTop: 72, paddingBottom: 72 }} className="tl-how-section">
        <div
          className="tl-how-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.02fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div className="tl-how-fade tl-how-hero-copy">
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
              How it works
            </div>

            <h1
              className="tl-how-hero-title"
              style={{
                fontSize: 64,
                lineHeight: 0.98,
                letterSpacing: '-0.045em',
                color: C.white,
                fontWeight: 800,
                maxWidth: 660,
                marginBottom: 16,
              }}
            >
              Launch the storefront.
              <br />
              Capture the order.
              <br />
              Keep the next one in motion.
            </h1>
            <p
              className="tl-how-body-copy"
              style={{
                fontSize: 19,
                lineHeight: 1.65,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
              }}
            >
              TrayLoop gives the merchant one clean loop: go live, fulfill the ticket, and keep revenue compounding after the deposit lands.
            </p>

            <div className="tl-how-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
              <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
              <PillButton text="View product" href="/product" variant="ghost" size="md" />
            </div>
          </div>

          <div className="tl-how-fade tl-how-delay-1">
            <div className="tl-how-hero-canvas">
              <HeroCanvas />
            </div>
          </div>
        </div>
      </Section>

      <Section bg={C.white} className="tl-how-section">
        <div className="tl-how-fade tl-how-heading-block">
          <Eyebrow text="The sequence" />
          <Heading
            className="tl-how-section-title"
            title="The story is linear, which makes it easier to teach and easier to run."
            summary="Each step introduces one new layer of leverage without breaking the flow the merchant already understands."
          />
        </div>

        <div style={{ display: 'grid', gap: 18, marginTop: 30 }}>
          {howItWorksSteps.map((step, index) => (
            <div key={step.number} className={`tl-how-fade tl-how-delay-${index + 1}`}>
              <StepPanel step={step} reverse={index % 2 === 1} dark={step.number === '04'} />
            </div>
          ))}
        </div>
      </Section>

      <Section bg={C.creamDark} className="tl-how-section">
        <div className="tl-how-fade tl-how-heading-block">
          <Eyebrow text="What each team sees" />
          <Heading
            className="tl-how-section-title"
            title="The same order, rendered for three different jobs."
            summary="Customer, kitchen, and operator all get the slice of the experience they need, so nothing important gets lost between screens."
          />
        </div>

        <div className="tl-how-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, marginTop: 30 }}>
          <div className="tl-how-fade tl-how-delay-1">
            <SurfaceCard
              title="Customer"
              bullets={[
                'Branded checkout and deposit flow',
                'Clear confirmations and updates',
                'The path back to the next booking',
              ]}
            />
          </div>
          <div className="tl-how-fade tl-how-delay-2">
            <SurfaceCard
              title="Kitchen"
              bullets={[
                'A kitchen ticket summary that is easy to read',
                'Timing, location, and counts in one place',
                'No extra noise between order and fulfillment',
              ]}
            />
          </div>
          <div className="tl-how-fade tl-how-delay-3">
            <SurfaceCard
              title="Operator"
              bullets={[
                'Merchant dashboard order view',
                'Follow up, reactivation, and reorder prompts',
                'Growth Advisor guidance when strategy matters',
              ]}
              dark
            />
          </div>
        </div>
      </Section>

      <section style={{ backgroundColor: C.ink, color: C.white, padding: '92px 24px' }}>
        <div
          className="tl-how-closing"
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
            <h2 style={{ fontSize: 44, lineHeight: 1.04, fontWeight: 800, marginBottom: 14, maxWidth: 660 }}>
              Launch gets you live. Momentum keeps it moving. Engine compounds it.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              That is the operating model behind the product and the reason the pages now lean on the same story.
            </p>
          </div>
          <div className="tl-how-closing-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
            <PillButton text="View product" href="/product" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
