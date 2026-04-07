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
    <section style={{ backgroundColor: bg, padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

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

function BulletItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, listStyle: 'none' }}>
      <TealDot />
      <span style={{ color: color.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>
    </li>
  );
}

export default function RevenueDashboardPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
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
            Revenue Dashboard
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            See Every Catering Dollar — Captured, Recurring, and At Risk
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, maxWidth: 600, margin: '0 auto' }}>
            Track monthly recurring revenue by account, flag at-risk customers before they
            churn, and see exactly how much revenue your automation has recovered.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
          alt="Analytics dashboard"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── BENEFITS + MOCKUP ── */}
      <Section bg={color.white}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {/* Benefits */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 24 }}>
              Full visibility into your catering revenue
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Monthly recurring revenue broken down by account" />
              <BulletItem text="At-risk accounts flagged before they churn" />
              <BulletItem text="Revenue recovered tracking from automated outreach" />
              <BulletItem text="Upcoming order pipeline with projected revenue" />
              <BulletItem text="AI-assisted insights surface trends and opportunities" />
              <BulletItem text="Trend visualization across weeks and months" />
            </ul>
          </div>

          {/* Mockup: Dashboard with KPIs and account table */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.white,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: color.ink, marginBottom: 16 }}>
                Revenue Overview — April
              </div>

              {/* KPI cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: 'Monthly Recurring', value: '$12,840', trend: '+18%', up: true },
                  { label: 'Revenue Recovered', value: '$3,620', trend: '+$1,840', up: true },
                  { label: 'At-Risk Accounts', value: '3', trend: '\u2212 action needed', up: false },
                  { label: 'Pipeline (Next 7d)', value: '$4,200', trend: '6 orders', up: true },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      backgroundColor: color.cream,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: 11, color: color.muted }}>{kpi.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color.ink, marginTop: 2 }}>
                      {kpi.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: kpi.up ? color.teal : color.red,
                        marginTop: 4,
                      }}
                    >
                      {kpi.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Account table */}
              <div style={{ fontSize: 12, fontWeight: 600, color: color.muted, marginBottom: 8 }}>
                Top Accounts
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 70px',
                  gap: 0,
                  fontSize: 12,
                  color: color.muted,
                  padding: '6px 10px',
                  borderBottom: `1px solid ${color.creamDark}`,
                }}
              >
                <span>Account</span>
                <span style={{ textAlign: 'right' }}>MRR</span>
                <span style={{ textAlign: 'right' }}>Status</span>
              </div>
              {[
                { name: 'Apex Financial', mrr: '$2,480', status: 'Active', statusColor: color.teal },
                { name: 'Meridian Law', mrr: '$1,960', status: 'Active', statusColor: color.teal },
                { name: 'NovaTech', mrr: '$1,440', status: 'At Risk', statusColor: color.red },
                { name: 'Summit HR', mrr: '$1,200', status: 'Active', statusColor: color.teal },
                { name: 'Beacon Media', mrr: '$980', status: 'Dormant', statusColor: color.orange },
              ].map((acct) => (
                <div
                  key={acct.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 70px',
                    gap: 0,
                    fontSize: 13,
                    padding: '10px 10px',
                    borderBottom: `1px solid ${color.creamDark}`,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 500, color: color.ink }}>{acct.name}</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: color.ink }}>
                    {acct.mrr}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontSize: 11,
                      fontWeight: 600,
                      color: acct.statusColor,
                    }}
                  >
                    {acct.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <Section bg={color.cream}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '$12,840', label: 'Average MRR tracked per merchant' },
            { value: '3', label: 'At-risk accounts caught before churn' },
            { value: '$3,620', label: 'Revenue recovered this month' },
          ].map((s) => (
            <div key={s.label} style={{ padding: 24 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: color.ink, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 15, color: color.muted, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
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
            Know exactly where your catering revenue stands.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            See the Revenue Dashboard in action and take control of every dollar.
          </p>
          <PillButton text="Book a free Demo \u2192" href="/demo" variant="primary" />
        </div>
      </Section>
    </main>
  );
}
