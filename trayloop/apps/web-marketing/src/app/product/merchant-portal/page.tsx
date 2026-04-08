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

export default function MerchantPortalPage() {
  const sidebarItems = [
    'Dashboard',
    'Orders',
    'Customers',
    'Offerings',
    'Locations',
    'Follow-Ups',
    'Revenue Intelligence',
    'Automations',
    'Settings',
  ];

  const modules = [
    { emoji: '\u{1F4CA}', name: 'Dashboard', desc: 'KPIs at a glance, recent orders, and a real-time activity feed.' },
    { emoji: '\u{1F4E6}', name: 'Orders', desc: 'Status tracking, customer info, and a full order timeline.' },
    { emoji: '\u{1F465}', name: 'Customers', desc: 'Health scores, order history, and smart customer segments.' },
    { emoji: '\u{1F37D}\uFE0F', name: 'Offerings', desc: 'Package builder, add-on catalog, and flexible pricing rules.' },
    { emoji: '\u{1F4CD}', name: 'Locations', desc: 'Multi-location management, delivery zones, and capacity caps.' },
    { emoji: '\u{1F4E7}', name: 'Follow-Ups', desc: 'Automated outreach tracking across every customer touchpoint.' },
    { emoji: '\u{1F4B0}', name: 'Revenue Intelligence', desc: 'AI-powered insights, revenue trends, and growth opportunities.' },
    { emoji: '\u{1F916}', name: 'Automations', desc: 'Rules engine, campaign builder, and one-click approve/send.' },
    { emoji: '\u2699\uFE0F', name: 'Settings', desc: 'Profile, team access, Stripe config, and brand customization.' },
  ];

  const selfServeCards = [
    { title: 'Update your menu', desc: 'Changes go live instantly. No support ticket required.' },
    { title: 'Adjust location settings', desc: 'Hours, zones, capacity \u2014 tweak anything per location.' },
    { title: 'Review AI campaigns', desc: 'See what TrayLoop drafted, approve or edit, then send.' },
    { title: 'Track everything', desc: 'Orders, revenue, customers \u2014 every metric in one place.' },
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
            Merchant Self-Service Portal
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
            Run your entire catering operation from one dashboard
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
            Manage orders, customers, menus, locations, and revenue from a single
            screen. No support tickets. No back-and-forth emails. Everything you
            need, self-serve.
          </p>
        </div>
      </Section>

      {/* ── HERO IMAGE ── */}
      <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 60 }}>
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=400&fit=crop"
          alt="Modern restaurant interior with warm lighting"
          style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
        />
      </Section>

      {/* ── DASHBOARD MOCKUP ── */}
      <Section bg={color.white}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color.ink,
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          Your command center
        </h2>
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${color.creamDark}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Browser chrome bar */}
          <div
            style={{
              backgroundColor: color.creamDark,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28C840' }} />
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: color.white,
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 12,
                color: color.muted,
                fontFamily: 'monospace',
              }}
            >
              dashboard.trayloophq.com
            </div>
          </div>

          {/* Dashboard body */}
          <div style={{ display: 'flex', minHeight: 380 }}>
            {/* Sidebar */}
            <div
              style={{
                width: 220,
                backgroundColor: color.ink,
                padding: '24px 0',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: '0 20px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.white,
                }}
              >
                TrayLoop
              </div>
              {sidebarItems.map((item, i) => (
                <div
                  key={item}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? color.white : color.muted,
                    backgroundColor: i === 0 ? 'rgba(66,217,160,0.15)' : 'transparent',
                    borderLeft: i === 0 ? `3px solid ${color.teal}` : '3px solid transparent',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main content placeholder */}
            <div
              style={{
                flex: 1,
                backgroundColor: color.cream,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: color.muted,
                  fontStyle: 'italic',
                }}
              >
                Screenshot area
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9 MODULES ── */}
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
          9 modules. One platform.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: color.muted,
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto 48px',
            lineHeight: 1.5,
          }}
        >
          Everything you need to run, grow, and automate your catering business.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {modules.map((m) => (
            <div
              key={m.name}
              style={{
                backgroundColor: color.white,
                borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${color.creamDark}`,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{m.emoji}</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: color.ink,
                  marginBottom: 8,
                }}
              >
                {m.name}
              </div>
              <div style={{ fontSize: 14, color: color.muted, lineHeight: 1.5 }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SELF-SERVICE (dark bg) ── */}
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
          Change anything. Anytime. Without calling anyone.
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
          Full self-service means you never wait on support for routine changes.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {selfServeCards.map((c) => (
            <div
              key={c.title}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '28px 24px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: color.white,
                  marginBottom: 8,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 14, color: '#C2B9AE', lineHeight: 1.5 }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

    </main>
  );
}
