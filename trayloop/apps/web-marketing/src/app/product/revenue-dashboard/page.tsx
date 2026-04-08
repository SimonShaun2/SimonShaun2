import type { CSSProperties } from 'react';
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

export default function RevenueDashboardPage() {
  const kpis = [
    { label: 'Total Revenue', value: '$18,400', color: color.ink },
    { label: 'Repeat Revenue', value: '$12,800', sub: '69%', color: color.teal },
    { label: 'New Revenue', value: '$5,600', color: color.ink },
    { label: 'Recovered', value: '$1,840', color: color.teal },
    { label: 'At-Risk', value: '$3,200', color: color.red },
  ];

  const customers = [
    { name: 'Apex Financial', orders: 12, revenue: '$4,280', lastOrder: 'Mar 28', segment: 'Enterprise', segColor: color.teal, status: 'Healthy' },
    { name: 'Meridian Law', orders: 8, revenue: '$3,120', lastOrder: 'Mar 22', segment: 'Growth', segColor: color.orange, status: 'Healthy' },
    { name: 'NovaTech', orders: 5, revenue: '$2,440', lastOrder: 'Feb 14', segment: 'Enterprise', segColor: color.teal, status: 'At Risk' },
    { name: 'Summit HR', orders: 6, revenue: '$1,960', lastOrder: 'Mar 30', segment: 'Growth', segColor: color.orange, status: 'Healthy' },
    { name: 'Beacon Media', orders: 3, revenue: '$1,080', lastOrder: 'Jan 8', segment: 'Starter', segColor: color.muted, status: 'Dormant' },
  ];

  const insights = [
    {
      type: '\u26A0\uFE0F AT-RISK ALERT',
      typeColor: color.red,
      insight: 'NovaTech hasn\'t ordered in 42 days. Their average reorder cycle is 14 days.',
      action: 'Send a personalized check-in email with their last order details.',
      actionColor: color.orange,
    },
    {
      type: '\u{1F4C8} GROWTH OPPORTUNITY',
      typeColor: color.teal,
      insight: 'Apex Financial orders lunch every Tuesday but never adds beverages.',
      action: 'Suggest a beverage add-on in their next order confirmation.',
      actionColor: color.teal,
    },
    {
      type: '\u{1F4B0} REVENUE CONCENTRATION',
      typeColor: color.orange,
      insight: '38% of your revenue comes from a single account. That\'s a risk.',
      action: 'Prioritize outreach to your next 5 highest-potential accounts.',
      actionColor: color.teal,
    },
    {
      type: '\u{1F3AF} REORDER PREDICTION',
      typeColor: color.teal,
      insight: 'Summit HR is due to reorder within the next 3 days based on their cadence.',
      action: 'Queue a reorder reminder for tomorrow morning.',
      actionColor: color.orange,
    },
  ];

  const actionSteps = [
    { emoji: '\u{1F441}\uFE0F', title: 'See the insight', desc: 'AI surfaces patterns from your order data \u2014 at-risk accounts, growth signals, revenue trends.' },
    { emoji: '\u{1F4CB}', title: 'Review the recommendation', desc: 'Each insight comes with a specific, actionable recommendation you can approve or dismiss.' },
    { emoji: '\u26A1', title: 'Take action in one click', desc: 'Send the email, queue the campaign, or flag the account \u2014 right from the insight card.' },
  ];

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
            See every catering dollar &mdash; captured, recurring, and at risk
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: color.muted,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Track monthly recurring revenue by account, flag at-risk customers
            before they churn, and see exactly how much revenue your automation
            has recovered.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=900&h=400&fit=crop"
          alt="Catering event setup with decorated tables"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── DASHBOARD MOCKUP ── */}
      <Section bg={color.creamDark}>
        <div
          style={{
            backgroundColor: color.white,
            borderRadius: 16,
            padding: '28px 28px 20px',
            border: `1px solid ${color.creamDark}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: color.muted,
              letterSpacing: 1.2,
              textTransform: 'uppercase' as const,
              marginBottom: 24,
            }}
          >
            Revenue Overview &mdash; Last 30 Days
          </div>

          {/* KPI cards */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 28,
            }}
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  flex: '1 1 180px',
                  backgroundColor: color.cream,
                  borderRadius: 10,
                  padding: '14px 16px',
                  minWidth: 140,
                }}
              >
                <div style={{ fontSize: 11, color: color.muted, marginBottom: 4 }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </div>
                {kpi.sub && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: color.teal, marginTop: 2 }}>
                    {kpi.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div
            style={{
              backgroundColor: color.cream,
              borderRadius: 10,
              padding: '40px 24px',
              textAlign: 'center',
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: 14, color: color.muted, fontStyle: 'italic' }}>
              Revenue trend chart
            </div>
          </div>

          {/* Customer health table */}
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: color.muted,
                letterSpacing: 1,
                textTransform: 'uppercase' as const,
                marginBottom: 12,
              }}
            >
              Customer Health
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 0.6fr 0.8fr 0.8fr 1fr 0.7fr',
                gap: 0,
                fontSize: 11,
                color: color.muted,
                padding: '8px 12px',
                borderBottom: `1px solid ${color.creamDark}`,
                fontWeight: 600,
              }}
            >
              <span>Name</span>
              <span style={{ textAlign: 'right' }}>Orders</span>
              <span style={{ textAlign: 'right' }}>Revenue</span>
              <span style={{ textAlign: 'right' }}>Last Order</span>
              <span style={{ textAlign: 'center' }}>Segment</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>
            {customers.map((c) => (
              <div
                key={c.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 0.6fr 0.8fr 0.8fr 1fr 0.7fr',
                  gap: 0,
                  fontSize: 13,
                  padding: '10px 12px',
                  borderBottom: `1px solid ${color.creamDark}`,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: color.ink }}>{c.name}</span>
                <span style={{ textAlign: 'right', color: color.ink }}>{c.orders}</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: color.ink }}>
                  {c.revenue}
                </span>
                <span style={{ textAlign: 'right', color: color.muted, fontSize: 12 }}>
                  {c.lastOrder}
                </span>
                <span style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: c.segColor,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: 12, color: color.ink }}>{c.segment}</span>
                </span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    color:
                      c.status === 'Healthy'
                        ? color.teal
                        : c.status === 'At Risk'
                          ? color.red
                          : color.orange,
                  }}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── AI INSIGHTS (dark bg) ── */}
      <Section bg={color.ink}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.white,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Not just data. Recommendations you can act on today.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: '#C2B9AE',
            textAlign: 'center',
            maxWidth: 520,
            margin: '0 auto 48px',
            lineHeight: 1.5,
          }}
        >
          TrayLoop&apos;s AI analyzes your order data and surfaces 3&ndash;5 actionable
          insights every week.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insights.map((ins) => (
            <div
              key={ins.type}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '20px 24px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ins.typeColor,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase' as const,
                  flexShrink: 0,
                  minWidth: 180,
                  paddingTop: 2,
                }}
              >
                {ins.type}
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ fontSize: 14, color: color.white, lineHeight: 1.5, marginBottom: 8 }}>
                  {ins.insight}
                </div>
                <div style={{ fontSize: 13, color: ins.actionColor, fontWeight: 600 }}>
                  {ins.action}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            fontSize: 13,
            color: '#C2B9AE',
            fontStyle: 'italic',
          }}
        >
          TrayLoop delivers 3&ndash;5 insights like these every week, automatically.
        </div>
      </Section>

      {/* ── FROM INSIGHT TO ACTION ── */}
      <Section bg={color.creamDark}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          From insight to action
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {actionSteps.map((step) => (
            <div
              key={step.title}
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{step.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

    </main>
  );
}
