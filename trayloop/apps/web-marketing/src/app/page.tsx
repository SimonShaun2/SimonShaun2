import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

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
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {/* Left column */}
          <div style={{ flex: '1 1 480px', minWidth: 320 }}>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: color.ink,
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Your Catering Revenue Is&nbsp;Leaking. Every&nbsp;Week.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: color.muted,
                marginBottom: 28,
                maxWidth: 500,
              }}
            >
              The average restaurant loses{' '}
              <strong style={{ color: color.ink }}>$4,840/month</strong> in catering revenue to
              marketplace commissions, missed reorders, and manual follow-ups that never happen.
            </p>

            <ul style={{ padding: 0, marginBottom: 32 }}>
              <CheckItem text="No commissions on direct orders." />
              <CheckItem text="$49/month + 5% platform fee — that's it." />
              <CheckItem text="We handle the setup. Cancel anytime." />
            </ul>

            {/* Calculator CTA card */}
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 28,
                border: `1px solid ${color.creamDark}`,
                maxWidth: 420,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.muted, marginBottom: 12 }}>
                How much are you losing?
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: color.cream,
                  borderRadius: 10,
                  padding: '10px 16px',
                  marginBottom: 16,
                }}
              >
                <span style={{ color: color.muted, fontSize: 14 }}>Monthly catering revenue</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontWeight: 600,
                    color: color.ink,
                    fontSize: 16,
                  }}
                >
                  $12,000
                </span>
              </div>
              <PillButton text="See my savings →" href="/pricing" variant="primary" size="md" />
            </div>
          </div>

          {/* Right column – Dashboard mockup */}
          <div style={{ flex: '1 1 440px', minWidth: 320 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: color.ink }}>
                    Rosario&apos;s Kitchen
                  </div>
                  <div style={{ fontSize: 13, color: color.muted, marginTop: 2 }}>
                    Catering Dashboard
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#E8FAF1',
                    color: '#1A8A5A',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: color.teal,
                    }}
                  />
                  System running automatically
                </div>
              </div>

              {/* KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  { label: 'Monthly Revenue', value: '$18,400' },
                  { label: 'Active Accounts', value: '34' },
                  { label: 'Reorder Rate', value: '72%' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      backgroundColor: color.cream,
                      borderRadius: 10,
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ fontSize: 12, color: color.muted }}>{kpi.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: color.ink, marginTop: 4 }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity */}
              <div style={{ fontSize: 13, fontWeight: 600, color: color.muted, marginBottom: 10 }}>
                Recent Activity
              </div>
              {[
                {
                  text: 'Reorder reminder sent to Apex Financial',
                  time: '2 hours ago',
                  dot: color.teal,
                },
                {
                  text: 'New catering order — $1,240 from TechCorp',
                  time: '5 hours ago',
                  dot: color.orange,
                },
                {
                  text: 'Upsell added: beverage package +$85',
                  time: 'Yesterday',
                  dot: color.teal,
                },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: `1px solid ${color.creamDark}`,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: item.dot,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 14, color: color.ink, flex: 1 }}>{item.text}</span>
                  <span style={{ fontSize: 12, color: color.muted, whiteSpace: 'nowrap' }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
            { name: "Maria's Cocina", activity: 'Switched from EzCater — saved $2,100/mo in commissions', time: '3 days ago' },
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
            We were paying EzCater $3,200 a month in commissions and had no idea who our customers
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
                "You're doing $10K+/month in catering through EzCater or another marketplace. You're profitable — but 30% of every dollar goes to someone else. You want to own your customers and keep your revenue.",
            },
            {
              title: 'The Inconsistent Operator',
              description:
                "You get catering orders, but they're unpredictable. Some weeks are great, others are dead. You know you should follow up with past customers, but there's no system and no time. You need automation, not another task.",
            },
            {
              title: 'The Growth-Ready Team',
              description:
                "You've got a solid catering program and a team to support it. Now you need infrastructure: a portal, CRM, automated follow-ups, and data. You're ready to scale — you just need the engine.",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                flex: '1 1 300px',
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${color.creamDark}`,
              }}
            >
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
