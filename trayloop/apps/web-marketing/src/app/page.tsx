import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';
import SavingsCalculator from '@/components/savings-calculator';
import AnimatedHero from '@/components/animated-hero';

/* ── Design tokens ── */
const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

/* ── Reusable section wrapper ── */
function Section({
  children,
  bg = 'transparent',
  style,
  className,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        backgroundColor: bg,
        padding: '80px 24px',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

/* ── Small helpers ── */
function TealDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color.teal,
        marginRight: 10,
        flexShrink: 0,
        marginTop: 7,
      }}
    />
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, listStyle: 'none' }}>
      <TealDot />
      <span style={{ color: color.ink, fontSize: 16, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

function XItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14, listStyle: 'none' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#FDEAEA',
          color: color.red,
          fontSize: 13,
          fontWeight: 700,
          marginRight: 10,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ✕
      </span>
      <span style={{ color: color.ink, fontSize: 16, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

/* ── Stat card for credibility bar ── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: color.ink }}>{value}</div>
      <div style={{ fontSize: 14, color: color.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 300px',
        backgroundColor: color.white,
        borderRadius: 16,
        padding: 32,
        border: `1px solid ${color.creamDark}`,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: color.orange,
          marginBottom: 12,
        }}
      >
        {number}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: color.ink, marginBottom: 12 }}>{title}</h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: color.muted }}>{description}</p>
    </div>
  );
}

/* ── Outcome card (dark) ── */
function OutcomeCard({
  title,
  aiNote,
  stat,
}: {
  title: string;
  aiNote: string;
  stat: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 300px',
        backgroundColor: '#2A2520',
        borderRadius: 16,
        padding: 32,
      }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 700, color: color.white, marginBottom: 16, lineHeight: 1.4 }}>
        {title}
      </h3>
      <div
        style={{
          fontSize: 13,
          color: color.teal,
          marginBottom: 12,
        }}
      >
        Assisted by AI: <span style={{ color: '#C2B9AE' }}>{aiNote}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color.white }}>{stat}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main>
      {/* ── HERO — Lean: headline + 2 CTAs + animated product ── */}
      <style>{`
        @media (max-width: 768px) {
          .tl-hero-section {
            padding-top: 32px !important;
            padding-bottom: 24px !important;
          }
          .tl-hero-text {
            margin-bottom: 20px !important;
          }
          .tl-hero-headline {
            font-size: 32px !important;
            line-height: 1.15 !important;
            margin-bottom: 12px !important;
          }
          .tl-hero-sub {
            font-size: 15px !important;
            margin-bottom: 20px !important;
          }
          .tl-hero-ctas {
            gap: 10px !important;
          }
          .tl-hero-ctas > * {
            font-size: 13px !important;
          }
        }
        @media (max-width: 480px) {
          .tl-hero-section {
            padding-top: 24px !important;
          }
          .tl-hero-headline {
            font-size: 28px !important;
          }
        }
      `}</style>
      <Section bg={color.cream} style={{ paddingTop: 80, paddingBottom: 40 }} className="tl-hero-section">
        <div className="tl-hero-text" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 40px' }}>
          <h1
            className="tl-hero-headline"
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            Catering revenue that stays with your restaurant.
          </h1>
          <p
            className="tl-hero-sub"
            style={{
              fontSize: 19,
              lineHeight: 1.5,
              color: color.muted,
              marginBottom: 32,
              maxWidth: 560,
              margin: '0 auto 32px',
            }}
          >
            Replace marketplace commissions with a direct ordering system you own.
          </p>

          <div className="tl-hero-ctas" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton text="Start Keeping Your Revenue →" href="https://dashboard.trayloophq.com/register" variant="primary" />
            <PillButton text="See the System →" href="/product" variant="ghost" />
          </div>
        </div>

        {/* Animated product hero */}
        <AnimatedHero />
      </Section>

      {/* ── SAVINGS CALCULATOR ── */}
      <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: color.ink, marginBottom: 8 }}>See what you&apos;re losing.</h2>
          <p style={{ fontSize: 15, color: color.muted }}>Most owners underestimate this by thousands.</p>
        </div>
        <SavingsCalculator />
      </Section>

      {/* ── IMAGE STRIP — ICP ── */}
      <Section bg={color.cream} style={{ padding: '0 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.orange, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Built for</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink }}>Any kitchen that does catering</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop', alt: 'Restaurant chef preparing catering orders', caption: 'Restaurants' },
            { src: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400&h=300&fit=crop', alt: 'Food truck owner serving customers', caption: 'Food Trucks' },
            { src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=300&fit=crop', alt: 'Catering company team setting up event', caption: 'Catering Companies' },
            { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', alt: 'Cloud kitchen worker packaging orders', caption: 'Cloud Kitchens' },
          ].map((img) => (
            <div key={img.src} style={{ flexShrink: 0 }}>
              <img
                src={img.src}
                alt={img.alt}
                style={{ width: 260, height: 195, objectFit: 'cover', borderRadius: 12, display: 'block' }}
              />
              <div style={{ fontSize: 12, color: color.muted, marginTop: 8, textAlign: 'center' }}>{img.caption}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CREDIBILITY BAR ── */}
      <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <StatCard value="$2.4M+" label="Catering revenue processed" />
          <StatCard value="72%" label="Average reorder rate" />
          <StatCard value="3×" label="More repeat orders vs. marketplace" />
          <StatCard value="$1,840/mo" label="Average revenue recovered" />
        </div>
        {/* Trust compression */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            borderTop: `1px solid rgba(0,0,0,0.06)`,
            paddingTop: 24,
          }}
        >
          {[
            { label: 'Live in days', desc: 'not weeks' },
            { label: 'No migration risk', desc: 'we handle setup' },
            { label: 'Works with your process', desc: 'POS-agnostic' },
            { label: 'Keep existing channels', desc: 'marketplace-compatible' },
          ].map((t) => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(66, 217, 160, 0.15)',
                  color: color.teal,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: color.ink }}>{t.label}</div>
                <div style={{ fontSize: 12, color: color.muted }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── URGENCY SECTION ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: color.ink,
              marginBottom: 12,
            }}
          >
            Restaurants switching from marketplace to direct
          </h2>
          <p style={{ fontSize: 16, color: color.muted }}>
            Real operators. Real results. Happening right now.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          {[
            { name: "Maria's Cocina", activity: 'Switched from marketplace to direct — saved $2,100/mo in commissions', time: '3 days ago' },
            { name: 'Greenleaf Catering Co.', activity: 'First automated reorder generated — $890 order, zero effort', time: '1 week ago' },
            { name: 'Brooklyn Bites', activity: 'Set up direct ordering portal — 12 accounts migrated in 48 hrs', time: '2 weeks ago' },
          ].map((r) => (
            <div
              key={r.name}
              style={{
                flex: '1 1 300px',
                maxWidth: 340,
                backgroundColor: color.white,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontWeight: 700, color: color.ink, fontSize: 16, marginBottom: 8 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5, marginBottom: 8 }}>
                {r.activity}
              </div>
              <div style={{ fontSize: 12, color: color.muted }}>{r.time}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── MID CTA ── */}
      <Section bg={color.cream} style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton text="See What You're Losing →" href="#calculator" variant="primary" />
          <PillButton text="See the System →" href="/product" variant="ghost" />
        </div>
      </Section>

      {/* ── PROBLEM SECTION ── */}
      <Section bg={color.white}>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: color.ink,
            lineHeight: 1.2,
            textAlign: 'center',
            marginBottom: 48,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Marketplace platforms don&apos;t grow your catering business. They tax it.
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: color.muted,
            textAlign: 'center',
            maxWidth: 680,
            margin: '-24px auto 40px',
          }}
        >
          They don&apos;t help you grow. They sit in the middle and take a percentage.
        </p>

        <img
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1100&h=400&fit=crop"
          alt="Busy restaurant kitchen during service"
          style={{ width: '100%', borderRadius: 16, marginBottom: 40, display: 'block', objectFit: 'cover', maxHeight: 400 }}
        />

        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Pain points */}
          <div style={{ flex: '1 1 460px' }}>
            <ul style={{ padding: 0 }}>
              <XItem text="They take 15–30% of every order. Not for finding the customer. Not for cooking the food. Just for sitting in the middle." />
              <XItem text="They own your customers. That corporate account ordering $800/month? The marketplace has their data. You get a name on a ticket." />
              <XItem text="There's no follow-up. No repeat system. No compounding. Every Monday, your catering revenue starts at zero." />
              <XItem text="You're too busy running service to chase reorders and send proposals manually." />
              <XItem text="The longer you wait, the more it costs. Every month is more commissions paid and more customers lost." />
            </ul>
          </div>

          {/* Revenue Bleed card */}
          <div style={{ flex: '1 1 400px' }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 32,
                color: color.white,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: color.red,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                Monthly Revenue Bleed
              </div>
              {[
                { label: 'Marketplace commissions (30%)', value: '$3,600' },
                { label: 'Lost reorders (no follow-up)', value: '$640' },
                { label: 'Missed upsell opportunities', value: '$320' },
                { label: 'Manual process inefficiency', value: '$280' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: '#C2B9AE' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: color.red }}>{item.value}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                <span>Total lost per month</span>
                <span style={{ color: color.red }}>$4,840</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SYSTEM SECTION ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.orange,
              textTransform: 'uppercase' as const,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            The System
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: color.ink, lineHeight: 1.2, maxWidth: 760, margin: '0 auto 16px' }}>
            You don&apos;t have a catering system. You have transactions.
          </h2>
          <p style={{ fontSize: 18, color: color.muted, maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            TrayLoop replaces one-off orders with a repeatable system that captures, converts, and compounds — automatically.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <StepCard
            number="01"
            title="Capture"
            description="Every order comes directly to you. A branded ordering page replaces marketplace listings. Customers see your menu, your packages, your pricing. Deposits collected automatically. Zero commissions on every order."
          />
          <StepCard
            number="02"
            title="Convert"
            description="Every order runs itself. Confirmation, reminders, deposit collection — all triggered by the order, not by you remembering. Your kitchen gets a clean order. Your customer gets a professional experience. You touch nothing."
          />
          <StepCard
            number="03"
            title="Repeat"
            description="Every customer comes back. The system tracks ordering patterns and reaches out before customers go quiet. Targeted, timed outreach based on when each account is due to reorder. Revenue compounds instead of resetting."
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontSize: 17, fontWeight: 600, color: color.ink, marginBottom: 6 }}>
            Once it&apos;s set up, your catering doesn&apos;t reset every week. It builds.
          </p>
          <p style={{ fontSize: 15, color: color.muted }}>
            This is what marketplaces don&apos;t give you.
          </p>
        </div>
      </Section>

      {/* ── SEE THE STOREFRONT IN ACTION ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Left — Phone mockup */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 280,
                borderRadius: 36,
                border: `4px solid ${color.ink}`,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                backgroundColor: color.ink,
              }}
            >
              {/* Phone notch */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', backgroundColor: color.ink }}>
                <div style={{ width: 80, height: 5, borderRadius: 10, backgroundColor: '#333' }} />
              </div>
              {/* Storefront image */}
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=500&fit=crop"
                alt="Food spread representing your branded storefront"
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
              />
              {/* Phone bottom bar */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', backgroundColor: color.ink }}>
                <div style={{ width: 60, height: 4, borderRadius: 10, backgroundColor: '#444' }} />
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.orange, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 12 }}>
              Branded Storefront
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 16 }}>
              Your customers order directly from you
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: color.muted, marginBottom: 24 }}>
              No marketplace middleman. No commissions. Your customers see your brand, your menu, and your prices — on a storefront you own. Deposits are collected at checkout. Every order flows straight into your dashboard. You keep the customer relationship and the revenue.
            </p>
            <ul style={{ padding: 0, marginBottom: 24 }}>
              <CheckItem text="Branded URL — your name, your identity" />
              <CheckItem text="No marketplace listing or commission fees" />
              <CheckItem text="Deposits collected automatically at checkout" />
              <CheckItem text="Customers bookmark and reorder in seconds" />
            </ul>
            <a
              href="https://order.trayloophq.com/downtown-kitchen"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: color.orange,
                color: color.white,
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              See a live storefront example →
            </a>
          </div>
        </div>
      </Section>

      {/* ── REVENUE ENGINE SECTION ── */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.orange,
              textTransform: 'uppercase' as const,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            How You Grow
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.white,
              lineHeight: 1.2,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Turn one order into a recurring account. Then do it again.
          </h2>
        </div>

        {/* 3 outcome cards */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 48 }}>
          <OutcomeCard
            title="Customers come back without you chasing them"
            aiNote="Predicts the best time to send a reorder reminder based on past order patterns."
            stat="72% reorder rate"
          />
          <OutcomeCard
            title="Know exactly who's about to disappear"
            aiNote="Flags accounts showing signs of churn before they stop ordering."
            stat="3× fewer lost accounts"
          />
          <OutcomeCard
            title="Send the right message without writing a word"
            aiNote="Generates personalized follow-ups and proposals based on order history."
            stat="14 hrs/week saved"
          />
        </div>

        {/* Full-width upsell card */}
        <div
          style={{
            backgroundColor: '#2A2520',
            borderRadius: 16,
            padding: 40,
            marginBottom: 48,
          }}
        >
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 16,
                  lineHeight: 1.3,
                }}
              >
                Every order is an upsell opportunity
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#C2B9AE', marginBottom: 20 }}>
                Smart checkout suggestions add beverages, desserts, and premium upgrades to every
                order — automatically. No manual quoting. No awkward phone calls.
              </p>
              <div style={{ fontSize: 13, color: color.teal }}>
                Assisted by AI:{' '}
                <span style={{ color: '#C2B9AE' }}>
                  Recommends the highest-converting add-ons based on order size and customer
                  history.
                </span>
              </div>
            </div>
            <div style={{ flex: '1 1 340px' }}>
              {/* Upsell mockup */}
              <div
                style={{
                  backgroundColor: color.ink,
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ fontSize: 13, color: color.muted, marginBottom: 12 }}>
                  Checkout — Suggested add-ons
                </div>
                {[
                  { item: 'Beverage Package', price: '+$85', pct: '+12%' },
                  { item: 'Dessert Platter', price: '+$65', pct: '+9%' },
                  { item: 'Premium Utensil Kit', price: '+$25', pct: '+4%' },
                ].map((u) => (
                  <div
                    key={u.item}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: color.white }}>{u.item}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: color.teal, fontWeight: 600 }}>{u.price}</span>
                      <span style={{ color: color.muted, fontSize: 12 }}>{u.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div
          style={{
            backgroundColor: '#2A2520',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: color.muted, marginBottom: 20 }}>
            Dashboard Preview
          </div>
          {/* KPIs row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              { label: 'Monthly Revenue', value: '$18,400', change: '+23%' },
              { label: 'Active Accounts', value: '34', change: '+8' },
              { label: 'Reorder Rate', value: '72%', change: '+12%' },
              { label: 'Avg Order Value', value: '$542', change: '+$38' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  backgroundColor: color.ink,
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 12, color: color.muted }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: color.white, marginTop: 4 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: color.teal, marginTop: 4 }}>{kpi.change}</div>
              </div>
            ))}
          </div>

          {/* Accounts table */}
          <div style={{ fontSize: 13, fontWeight: 600, color: color.muted, marginBottom: 12 }}>
            Top Accounts
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Account', 'Last Order', 'Total Revenue', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        color: color.muted,
                        fontSize: 12,
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Apex Financial',
                    date: 'Apr 2',
                    revenue: '$12,800',
                    status: 'Active',
                    statusColor: color.teal,
                  },
                  {
                    name: 'TechCorp HQ',
                    date: 'Mar 29',
                    revenue: '$9,420',
                    status: 'Active',
                    statusColor: color.teal,
                  },
                  {
                    name: 'Metro Law Group',
                    date: 'Mar 15',
                    revenue: '$6,200',
                    status: 'At risk',
                    statusColor: color.orange,
                  },
                ].map((row) => (
                  <tr key={row.name}>
                    <td style={{ padding: '10px 12px', color: color.white }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', color: '#C2B9AE' }}>{row.date}</td>
                    <td style={{ padding: '10px 12px', color: color.white, fontWeight: 600 }}>
                      {row.revenue}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          color: row.statusColor,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: row.statusColor,
                          }}
                        />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── BEFORE / AFTER ── */}
      <Section bg={color.cream}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Before &amp; After TrayLoop
        </h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Before */}
          <div
            style={{
              flex: '1 1 460px',
              backgroundColor: color.white,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: color.red,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              Before
            </div>
            <ul style={{ padding: 0 }}>
              {[
                '15–30% of every order goes to a platform you don\'t control',
                'No idea which accounts are about to stop ordering',
                'Follow-up happens when you remember — which is rarely',
                'Revenue resets to zero every Monday',
                'No system. Just hustle.',
              ].map((t) => (
                <XItem key={t} text={t} />
              ))}
            </ul>
          </div>

          {/* After */}
          <div
            style={{
              flex: '1 1 460px',
              backgroundColor: color.white,
              borderRadius: 16,
              padding: 32,
              border: `1px solid ${color.creamDark}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: color.teal,
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              After
            </div>
            <ul style={{ padding: 0 }}>
              {[
                'Zero commissions — every dollar stays with your restaurant',
                'At-risk accounts flagged before they disappear',
                'Automated follow-up and reorder outreach runs without you',
                'Revenue that compounds month over month',
                'A system that runs while you run service',
              ].map((t) => (
                <CheckItem key={t} text={t} />
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIAL ── */}
      <Section bg={color.white}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: color.creamDark, lineHeight: 1, marginBottom: 16 }}>
            &ldquo;
          </div>
          <blockquote
            style={{
              fontSize: 22,
              lineHeight: 1.6,
              color: color.ink,
              fontStyle: 'italic',
              marginBottom: 24,
            }}
          >
            We were paying $3,200 a month in marketplace commissions and had no idea who our customers even were. TrayLoop gave us our accounts back. Now 72% of them reorder on their own.
          </blockquote>
          <div style={{ fontWeight: 700, color: color.ink }}>Maria S.</div>
          <div style={{ fontSize: 14, color: color.muted }}>
            Owner, Rosario&apos;s Kitchen
          </div>
        </div>
      </Section>

      {/* ── WHO IT'S FOR ── */}
      <Section bg={color.cream}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Who It&apos;s For
        </h2>
        <p
          style={{
            fontSize: 16,
            color: color.muted,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          TrayLoop works for restaurants at every stage of catering growth.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            {
              title: 'The Marketplace Hostage',
              description:
                "You're doing $10K+/month in catering through marketplace platforms. You're profitable — but 30% of every dollar goes to someone else. You want to own your customers and keep your revenue.",
              img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop',
              alt: 'Office workers eating catered lunch',
            },
            {
              title: 'The Inconsistent Operator',
              description:
                "You get catering orders, but they're unpredictable. Some weeks are great, others are dead. You know you should follow up with past customers, but there's no system and no time. You need automation, not another task.",
              img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
              alt: 'Restaurant kitchen during busy service',
            },
            {
              title: 'The Growth-Ready Team',
              description:
                "You've got a solid catering program and a team to support it. Now you need infrastructure: a portal, CRM, automated follow-ups, and data. You're ready to scale — you just need the engine.",
              img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
              alt: 'Team meeting planning catering growth strategy',
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                flex: '1 1 300px',
                backgroundColor: color.white,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <img
                src={card.img}
                alt={card.alt}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: 32 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: color.ink,
                    marginBottom: 14,
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: color.muted }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer pre-CTA handles the closing CTA */}
    </main>
  );
}
