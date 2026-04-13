import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PillButton from '@/components/pill-button';
import { featureAtlas, growthAdvisor, plans } from '@/lib/marketing-story';

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
    <div style={{ maxWidth: 780 }}>
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
        borderRadius: 28,
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
      <span style={{ fontSize: 15, lineHeight: 1.55, color: light ? 'rgba(254,252,250,0.84)' : C.ink }}>
        {text}
      </span>
    </div>
  );
}

function PlanBlock({
  plan,
  reverse = false,
}: {
  plan: (typeof plans)[number];
  reverse?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: reverse ? '1fr 0.95fr' : '0.95fr 1fr',
        gap: 22,
        alignItems: 'stretch',
      }}
    >
      <Card
        dark={plan.name === 'Engine'}
        style={{
          color: plan.name === 'Engine' ? C.white : C.ink,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            backgroundColor: plan.name === 'Momentum' ? '#E9FBF3' : plan.name === 'Engine' ? 'rgba(66,217,160,0.14)' : '#F6EFE5',
            color: plan.name === 'Engine' ? C.teal : plan.name === 'Momentum' ? '#1D7A55' : C.orange,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
            marginBottom: 18,
          }}
        >
          {plan.badge}
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: plan.name === 'Engine' ? C.teal : C.orange,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            {plan.name}
          </div>
          <h3 style={{ fontSize: 34, lineHeight: 1.02, fontWeight: 800, marginBottom: 12 }}>{plan.summary}</h3>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: plan.name === 'Engine' ? 'rgba(254,252,250,0.8)' : C.muted,
              maxWidth: 640,
            }}
          >
            {plan.detail}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 8, marginTop: 24 }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{plan.price}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: plan.name === 'Engine' ? 'rgba(254,252,250,0.72)' : C.muted }}>
            {plan.cadence}
          </div>
        </div>
      </Card>

      <Card
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          gap: 20,
          background:
            plan.name === 'Launch'
              ? 'linear-gradient(180deg, #FFFDF9 0%, #FFF7F1 100%)'
              : plan.name === 'Momentum'
              ? 'linear-gradient(180deg, #FFFFFF 0%, #F0FBF6 100%)'
              : 'linear-gradient(180deg, #2C2520 0%, #231E19 100%)',
          color: plan.name === 'Engine' ? C.white : C.ink,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: plan.name === 'Engine' ? C.teal : C.orange,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            What it unlocks
          </div>
          <Link
            href="/pricing"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: plan.name === 'Engine' ? C.teal : C.orange,
              textDecoration: 'none',
            }}
          >
            See pricing
          </Link>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {plan.highlights.map((item) => (
            <Bullet key={item} text={item} light={plan.name === 'Engine'} />
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
            alignSelf: 'end',
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: plan.name === 'Engine' ? 'rgba(66,217,160,0.12)' : '#FFF6EE',
              border: plan.name === 'Engine' ? '1px solid rgba(66,217,160,0.18)' : '1px solid #F2E4D6',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Best for
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: plan.name === 'Engine' ? C.white : C.ink, marginTop: 8 }}>
              {plan.bestFor}
            </div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: plan.name === 'Engine' ? 'rgba(66,217,160,0.12)' : '#FFF6EE',
              border: plan.name === 'Engine' ? '1px solid rgba(66,217,160,0.18)' : '1px solid #F2E4D6',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Category
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: plan.name === 'Engine' ? C.white : C.ink, marginTop: 8 }}>
              {plan.name === 'Launch' ? 'Sell direct' : plan.name === 'Momentum' ? 'Repeat revenue' : 'AI growth'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdvisorBlock() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.95fr',
        gap: 22,
        alignItems: 'stretch',
      }}
    >
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
          background: 'linear-gradient(180deg, #FFF8F2 0%, #FFF2E8 100%)',
        }}
      >
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
            alignSelf: 'flex-start',
            marginBottom: 18,
          }}
        >
          {growthAdvisor.badge}
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.orange,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Growth Advisor
          </div>
          <h3 style={{ fontSize: 34, lineHeight: 1.02, fontWeight: 800, color: C.ink, marginBottom: 12 }}>
            A premium strategy layer for the operators who want help deciding what to do next.
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, maxWidth: 640 }}>
            {growthAdvisor.detail}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 24 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.ink }}>
            {growthAdvisor.price}
            <span style={{ fontSize: 16, fontWeight: 600, color: C.muted, marginLeft: 4 }}>{growthAdvisor.cadence}</span>
          </div>
        </div>
      </Card>

      <Card
        style={{
          display: 'grid',
          gap: 20,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F0E6 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.orange,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            What it adds
          </div>
          <Link
            href="/pricing"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.orange,
              textDecoration: 'none',
            }}
          >
            See pricing
          </Link>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {growthAdvisor.highlights.map((item) => (
            <Bullet key={item} text={item} />
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
            alignSelf: 'end',
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#FFF6EE',
              border: '1px solid #F2E4D6',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Best for
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 8 }}>{growthAdvisor.summary}</div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#FFF6EE',
              border: '1px solid #F2E4D6',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Category
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 8 }}>Strategy add-on</div>
          </div>
        </div>
      </Card>
    </div>
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
        @media (max-width: 960px) {
          .tl-product-hero,
          .tl-product-grid {
            grid-template-columns: 1fr !important;
          }
          .tl-product-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Section bg={C.ink} style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div
          className="tl-product-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.95fr',
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
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 20,
              }}
            >
              Product overview
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
              One platform.
              <br />
              Four growth layers.
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.82)',
                maxWidth: 620,
              }}
            >
              TrayLoop is not just a storefront. It is a direct catering system with Launch, Momentum, Engine, and
              Growth Advisor layered to grow revenue as the business gets more serious.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
              <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
              <PillButton text="How it works" href="/how-it-works" variant="ghost" size="md" />
            </div>
          </div>

          <div className="tl-product-fade tl-product-delay-1">
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
                    'linear-gradient(180deg, rgba(26,22,18,0.08) 0%, rgba(26,22,18,0.28) 40%, rgba(26,22,18,0.92) 100%)',
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
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Built for repeat revenue
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
                  }}
                >
                  <div style={{ fontSize: 13, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Product layer
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>Launch. Momentum. Engine. Growth Advisor.</div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(254,252,250,0.78)' }}>
                    Each layer adds the next capability: storefront, repeat revenue, AI growth, and strategic
                    support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bg={C.white}>
        <div className="tl-product-fade">
          <Eyebrow text="Product layers" />
          <Heading
            title="Each product layer exists to move a catering account further down the revenue ladder."
            summary="Launch gets the order live. Momentum makes repeat orders feel natural. Engine turns follow-up and retention into a system. Growth Advisor helps the merchant decide what to do next."
          />
        </div>

        <div className="tl-product-grid" style={{ display: 'grid', gap: 18, marginTop: 34 }}>
          {plans.map((plan, index) => (
            <div key={plan.name} className={`tl-product-fade tl-product-delay-${index + 1}`}>
              <PlanBlock plan={plan} reverse={index % 2 === 1} />
            </div>
          ))}

          <div className="tl-product-fade tl-product-delay-3">
            <AdvisorBlock />
          </div>
        </div>
      </Section>

      <Section bg={C.creamDark}>
        <div className="tl-product-fade">
          <Eyebrow text="Feature atlas" />
          <Heading
            title="The details that make Momentum and Engine matter."
            summary="These are the revenue levers the new tier story needs to show clearly: recurring scheduling, upsells, AI, and retention intelligence."
          />
        </div>

        <div className="tl-product-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginTop: 34 }}>
          {featureAtlas.map((group) => (
            <Card key={group.title} className="tl-product-hover" style={{ minHeight: 260 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.orange,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                {group.title}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {group.items.map((item) => (
                  <Bullet key={item} text={item} />
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
            <Eyebrow text="Growth path" />
            <h2 style={{ fontSize: 46, lineHeight: 1.04, fontWeight: 800, marginBottom: 16, maxWidth: 660 }}>
              TrayLoop grows with the account instead of resetting it.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(254,252,250,0.82)', maxWidth: 640 }}>
              That is what makes the pricing ladder feel real. Each upgrade adds the next repeat-revenue capability,
              and Growth Advisor gives operators a strategy layer when they want more guidance.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
            <PillButton text="See pricing" href="/pricing" variant="primary" size="md" />
            <PillButton text="Book a demo" href="/demo" variant="ghost" size="md" />
          </div>
        </div>
      </section>
    </main>
  );
}
