import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
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

export default function AiReengagementPage() {
  return (
    <>
      {/* ── HERO ── */}
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
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
            Grow Revenue
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
            Bring Back Customers Before They Disappear
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: color.muted, marginBottom: 32 }}>
            Most restaurants don&apos;t realize a customer has left until it&apos;s too late. TrayLoop&apos;s AI
            detects at-risk accounts based on ordering patterns and generates personalized outreach
            to bring them back — before they find another caterer.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>

      {/* ── IMAGE ── */}
      <Section bg={color.white} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=400&fit=crop"
          alt="Busy restaurant kitchen with chefs at work"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── TWO COLUMN: BENEFITS + VISUAL ── */}
      <Section bg={color.white}>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, lineHeight: 1.2, marginBottom: 20 }}>
              AI that watches your accounts so you don&apos;t have to.
            </h2>
            <ul style={{ padding: 0, margin: 0 }}>
              <BulletItem text="Pattern detection across order frequency, recency, and value" />
              <BulletItem text="At-risk flagging when an account breaks its usual cadence" />
              <BulletItem text="AI-generated outreach messages personalized to each customer" />
              <BulletItem text="One-click send or edit before reaching out" />
              <BulletItem text="Dashboard showing recovered revenue and win-back rates" />
              <BulletItem text="Works automatically in the background — no manual tracking" />
            </ul>
          </div>

          {/* ── AT-RISK ACCOUNT MOCKUP ── */}
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div
              style={{
                backgroundColor: color.ink,
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 13, color: color.muted, marginBottom: 20 }}>
                At-Risk Accounts Dashboard
              </div>
              {[
                {
                  name: 'Apex Financial',
                  lastOrder: '28 days ago',
                  usual: 'Every 14 days',
                  status: 'At risk',
                  statusColor: color.orange,
                },
                {
                  name: 'Summit Legal Group',
                  lastOrder: '35 days ago',
                  usual: 'Every 21 days',
                  status: 'At risk',
                  statusColor: color.orange,
                },
                {
                  name: 'Bright Horizons HR',
                  lastOrder: '42 days ago',
                  usual: 'Every 10 days',
                  status: 'Critical',
                  statusColor: '#FF6243',
                },
              ].map((account) => (
                <div
                  key={account.name}
                  style={{
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: color.white }}>{account.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: account.statusColor,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        padding: '3px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {account.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: color.muted }}>
                    Last order: {account.lastOrder} (usual: {account.usual})
                  </div>
                </div>
              ))}

              {/* AI suggestion preview */}
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(66,217,160,0.1)',
                  border: `1px solid ${color.teal}`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: color.teal, marginBottom: 8 }}>
                  AI-GENERATED OUTREACH
                </div>
                <div style={{ fontSize: 13, color: color.white, lineHeight: 1.5 }}>
                  &quot;Hi Sarah, it&apos;s been a few weeks since your last catering order. We&apos;d love to
                  help with your next team lunch — your usual order for 25 is saved and ready to go.&quot;
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: color.ink, marginBottom: 8 }}>
            Revenue you would have lost, recovered.
          </h2>
          <p style={{ fontSize: 16, color: color.muted }}>
            Average results from TrayLoop restaurants using AI re-engagement.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          {[
            { value: '$1,840', label: 'Recovered revenue per month' },
            { value: '72%', label: 'Reorder rate when contacted' },
            { value: '3.2x', label: 'ROI on re-engagement outreach' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                backgroundColor: color.white,
                borderRadius: 14,
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: color.teal, marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: color.muted }}>{stat.label}</div>
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
            Stop losing customers to silence.
          </h2>
          <p style={{ fontSize: 16, color: '#C2B9AE', marginBottom: 32 }}>
            TrayLoop&apos;s AI watches your accounts and brings them back before they disappear.
          </p>
          <PillButton text="Book a free Demo →" href="/demo" variant="primary" />
        </div>
      </Section>
    </>
  );
}
