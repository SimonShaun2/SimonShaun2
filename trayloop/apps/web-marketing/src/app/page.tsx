import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';
import SavingsCalculator from '@/components/savings-calculator';

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
}: {
  children: React.ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section
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
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 80, paddingBottom: 0 }}>
        {/* Hero text — centered */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', marginBottom: 48 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.orange, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Direct catering orders · Zero commissions
          </div>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.12,
              marginBottom: 20,
            }}
          >
            Your Catering Revenue Is&nbsp;Leaking. Every&nbsp;Week.
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              color: color.muted,
              marginBottom: 32,
              maxWidth: 620,
              margin: '0 auto 32px',
            }}
          >
            The average restaurant loses{' '}
            <strong style={{ color: color.ink }}>$4,840/month</strong> to marketplace commissions
            and missed reorders. TrayLoop gives you a branded ordering system, automated
            follow-up, and AI-assisted re-engagement — so every catering customer comes back.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <PillButton text="See how much you're losing →" href="#calculator" variant="primary" />
            <PillButton text="Sign Up →" href="https://dashboard.trayloophq.com/register" variant="ghost" />
          </div>

          <ul style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', padding: 0, margin: 0 }}>
            {['No commissions on direct orders', '$49/mo + 5% platform fee', 'We handle the setup'].map(t => (
              <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', fontSize: 14, color: color.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color.teal, flexShrink: 0 }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero visual — overlapping browser + phone mockup */}
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
          {/* Browser frame — Dashboard */}
          <div
            style={{
              backgroundColor: color.white,
              borderRadius: 16,
              border: `1px solid ${color.creamDark}`,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          >
            {/* Browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: color.creamDark, borderBottom: `1px solid ${color.creamDark}` }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#E85618', opacity: 0.6 }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F5C542', opacity: 0.6 }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#42D9A0', opacity: 0.6 }} />
              <div style={{ flex: 1, marginLeft: 12, backgroundColor: color.white, borderRadius: 6, padding: '6px 14px', fontSize: 12, color: color.muted }}>
                dashboard.trayloophq.com
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ display: 'flex', minHeight: 380 }}>
              {/* Sidebar */}
              <div style={{ width: 200, backgroundColor: color.ink, padding: '20px 0', flexShrink: 0 }}>
                <div style={{ padding: '0 16px 20px', fontSize: 16, fontWeight: 700, color: color.white }}>Tray.Loop</div>
                {['Dashboard', 'Orders', 'Customers', 'Offerings', 'Follow-Ups', 'Revenue', 'Automations'].map((item, i) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, color: i === 0 ? color.orange : '#9A8E84', backgroundColor: i === 0 ? 'rgba(232,86,24,0.1)' : 'transparent', borderLeft: i === 0 ? `3px solid ${color.orange}` : '3px solid transparent' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i === 0 ? color.orange : '#5A5350' }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ flex: 1, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color.ink }}>Dashboard</div>
                    <div style={{ fontSize: 13, color: color.muted }}>Downtown Kitchen · Austin, TX</div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#E8FAF1', color: '#1A8A5A', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color.teal }} />
                    System running
                  </div>
                </div>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'MONTHLY RECURRING', value: '$6,200', sub: 'from 7 accounts', accent: false },
                    { label: 'RECOVERED', value: '$1,840', sub: 'from re-engagement', accent: true },
                    { label: 'AT-RISK', value: '3', sub: 'dormant 30+ days', accent: false },
                    { label: 'UPCOMING', value: '8', sub: 'deposits secured', accent: false },
                  ].map(k => (
                    <div key={k.label} style={{ backgroundColor: color.cream, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: color.muted, letterSpacing: '0.05em' }}>{k.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: k.accent ? color.teal : color.ink, marginTop: 4 }}>{k.value}</div>
                      <div style={{ fontSize: 11, color: color.muted, marginTop: 2 }}>{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Activity rows */}
                <div style={{ fontSize: 11, fontWeight: 700, color: color.muted, marginBottom: 8, letterSpacing: '0.05em' }}>RECENT ACTIVITY</div>
                {[
                  { text: 'Reorder reminder sent to Apex Financial', time: '2 hrs ago', c: color.teal },
                  { text: 'New catering order — $1,240 from TechCorp', time: '5 hrs ago', c: color.orange },
                  { text: 'Upsell added: beverage package +$85', time: 'Yesterday', c: color.teal },
                ].map(a => (
                  <div key={a.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${color.creamDark}` }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: a.c, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: color.ink, flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: 11, color: color.muted, whiteSpace: 'nowrap' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone mockup — Storefront, floating on the right */}
          <div
            style={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              width: 280,
              backgroundColor: color.white,
              borderRadius: 28,
              border: `3px solid ${color.ink}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Phone notch */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', backgroundColor: color.ink }}>
              <div style={{ width: 80, height: 5, borderRadius: 10, backgroundColor: '#333' }} />
            </div>
            {/* Storefront header */}
            <div style={{ backgroundColor: color.cream, padding: '16px 16px 12px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: color.ink }}>Downtown Kitchen</div>
              <div style={{ fontSize: 11, color: color.muted, marginTop: 2 }}>Austin, TX · Corporate Catering</div>
              <div style={{ fontSize: 10, color: color.teal, marginTop: 6, fontWeight: 600 }}>● Accepting Orders</div>
            </div>
            {/* Menu items */}
            <div style={{ padding: '8px 12px', backgroundColor: color.cream }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: color.muted, marginBottom: 8, letterSpacing: '0.05em' }}>LUNCH PACKAGES</div>
              {[
                { name: 'Taco Platter', price: '$10/person', min: 'Min 10' },
                { name: 'Basic Lunch Box', price: '$14.95/person', min: 'Min 10' },
                { name: 'Premium Buffet', price: '$29.95/person', min: 'Min 20' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${color.creamDark}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: color.ink }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: color.muted }}>{p.min}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: color.orange }}>{p.price}</div>
                </div>
              ))}
              <div style={{ fontSize: 10, fontWeight: 700, color: color.muted, marginTop: 12, marginBottom: 8, letterSpacing: '0.05em' }}>ADD-ONS</div>
              {[
                { name: 'Dessert Tray', price: '+$45' },
                { name: 'Coffee & Tea', price: '+$3/pp' },
              ].map(a => (
                <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${color.creamDark}` }}>
                  <span style={{ fontSize: 12, color: color.ink }}>{a.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: color.teal }}>{a.price}</span>
                </div>
              ))}
            </div>
            {/* Order button */}
            <div style={{ padding: '12px 16px', backgroundColor: color.cream }}>
              <div style={{ backgroundColor: color.orange, color: color.white, textAlign: 'center', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Place Catering Order →
              </div>
            </div>
            {/* Phone bottom bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', backgroundColor: color.ink }}>
              <div style={{ width: 60, height: 4, borderRadius: 10, backgroundColor: '#444' }} />
            </div>
          </div>
        </div>
      </Section>

      {/* ── SAVINGS CALCULATOR ── */}
      <Section bg={color.creamDark} style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.orange, marginBottom: 8 }}>Revenue Calculator</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, marginBottom: 8 }}>How much are you losing to marketplaces?</h2>
          <p style={{ fontSize: 15, color: color.muted }}>Enter your monthly catering revenue to see the difference.</p>
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
          }}
        >
          <StatCard value="$2.4M+" label="Catering revenue processed" />
          <StatCard value="72%" label="Average reorder rate" />
          <StatCard value="3×" label="More repeat orders vs. marketplace" />
          <StatCard value="$1,840/mo" label="Average revenue recovered" />
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
          <PillButton text="See how much you're losing →" href="/pricing" variant="primary" />
          <PillButton text="See how it works →" href="/product" variant="ghost" />
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
          You&apos;re generating catering orders. You&apos;re not generating catering revenue.
        </h2>

        <img
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1100&h=400&fit=crop"
          alt="Busy restaurant kitchen during service"
          style={{ width: '100%', borderRadius: 16, marginBottom: 40, display: 'block', objectFit: 'cover', maxHeight: 400 }}
        />

        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Pain points */}
          <div style={{ flex: '1 1 460px' }}>
            <ul style={{ padding: 0 }}>
              <XItem text="30% of every order goes to the marketplace — not your kitchen." />
              <XItem text="You don't own the customer. They reorder through the platform, not you." />
              <XItem text="No one follows up. The $3,000 Friday lunch account quietly disappears." />
              <XItem text="You're too busy running service to chase reorders and send proposals." />
              <XItem text="Your catering revenue is unpredictable because there's no system behind it." />
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
          <h2 style={{ fontSize: 36, fontWeight: 700, color: color.ink, lineHeight: 1.2 }}>
            Three steps to catering revenue that grows itself
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <StepCard
            number="01"
            title="Capture"
            description="Replace marketplace dependency with your own branded ordering portal. Customers order directly from you — no commissions, no middlemen. Import existing accounts or let new ones sign up in seconds."
          />
          <StepCard
            number="02"
            title="Convert"
            description="Automatically follow up with every account at the right time. Smart reorder reminders, personalized upsells, and AI-assisted proposals turn one-time orders into recurring revenue."
          />
          <StepCard
            number="03"
            title="Repeat"
            description="Build a predictable catering pipeline. Track every account, see who's about to churn, and let the system keep your best customers coming back — without you lifting a finger."
          />
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
              No marketplace middleman. No 30% commissions. Your customers see your brand, your menu, and your prices on a clean ordering portal built just for you. Deposits are collected automatically at checkout, and every order flows straight into your dashboard.
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
            Turn one catering order into a recurring revenue account
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
                'Paying 30% commissions on every marketplace order',
                'No idea which accounts are about to churn',
                'Manually sending follow-up emails (when you remember)',
                'Revenue swings wildly week to week',
                'No system — just hustle and hope',
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
                'Zero commissions — customers order direct through your portal',
                'AI flags at-risk accounts before they disappear',
                'Automated reorder reminders and personalized upsells',
                'Predictable, growing monthly catering revenue',
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
            We were paying marketplaces $3,200 a month in commissions and had no idea who our customers
            even were. TrayLoop gave us our accounts back. Now 72% of them reorder automatically,
            and our catering revenue is up 40% in three months.
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

      {/* ── CLOSING CTA ── */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: color.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Stop leaking revenue. Start building a catering engine.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 8 }}>
            $49/month + 5% platform fee. No contracts. No commissions. Cancel anytime.
          </p>
          <p style={{ fontSize: 14, color: color.muted, marginBottom: 32 }}>
            We handle the full setup — your portal is live within 48 hours.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton text="See how much you're losing →" href="/pricing" variant="primary" />
            <PillButton text="See how it works →" href="/product" variant="ghost" />
          </div>
        </div>
      </Section>
    </main>
  );
}
