'use client';

import { useLaunchStatus } from '../lib/use-launch-status';
import { useMobile } from '../lib/use-mobile';
import { getLaunchHealthLine, getLaunchRailSummary, getLaunchReadinessRows } from '../lib/launch-story';

function statusTone(ready: boolean) {
  return ready
    ? { bg: '#F0FDF4', color: '#166534' }
    : { bg: '#FFF7ED', color: '#9A3412' };
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        background: bg,
        color,
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

const railStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 22,
  background: 'linear-gradient(180deg, #FFFDF9 0%, #FFFFFF 100%)',
  padding: 22,
  marginBottom: 24,
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  borderRadius: 12,
  background: '#1C1917',
  color: '#FFFFFF',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  borderRadius: 12,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#57534E',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
};

export default function LaunchStatusRail({
  contextLabel,
}: {
  contextLabel?: string;
}) {
  const { data, loading, error } = useLaunchStatus();
  const isMobile = useMobile(900);

  if (loading && !data) {
    return (
      <section style={railStyle}>
        <div style={{ fontSize: 13, color: '#78716C' }}>Loading launch center...</div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section style={railStyle}>
        <div style={{ fontSize: 13, color: '#B91C1C' }}>{error || 'Unable to load launch status.'}</div>
      </section>
    );
  }

  const ready = data.launch.blockers.length === 0;
  if (ready) {
    return null;
  }
  const tone = statusTone(ready);
  const sections = getLaunchReadinessRows(data);
  const summaryText = getLaunchRailSummary(data, contextLabel);
  const healthLine = getLaunchHealthLine(data);

  return (
    <section style={railStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#FFF2E8', color: '#E85618', padding: '6px 11px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Tier 1 launch system
          </div>
          <h2 style={{ margin: '12px 0 0', fontSize: 24, lineHeight: 1.05, letterSpacing: '-0.04em', fontFamily: 'var(--font-display), var(--font-body), sans-serif' }}>
            Launch Center
          </h2>
          <p style={{ margin: '8px 0 0', maxWidth: 620, color: '#57534E', fontSize: 14, lineHeight: 1.7 }}>
            {summaryText}
          </p>
        </div>

        <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C' }}>Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{data.launch.progressPercent}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: '#EEE7DD', overflow: 'hidden' }}>
            <div style={{ width: `${data.launch.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #E85618 0%, #D4A853 100%)', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge bg={tone.bg} color={tone.color}>{ready ? 'Ready to launch' : `${data.launch.completed}/${data.launch.total} milestones`}</Badge>
            <Badge bg={data.stripeMode === 'live' ? '#DCFCE7' : '#FEF3C7'} color={data.stripeMode === 'live' ? '#166534' : '#92400E'}>
              {data.stripeMode === 'live' ? 'Stripe live' : 'Stripe sandbox'}
            </Badge>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) minmax(280px, 0.9fr)', gap: 18, marginTop: 18 }}>
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 18, padding: 18, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C' }}>What to do next</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#1C1917' }}>{data.launch.nextAction.title}</div>
            </div>
            <a href="/launch" style={primaryLinkStyle}>Open launch center</a>
          </div>

          <p style={{ margin: 0, fontSize: 14, color: '#57534E', lineHeight: 1.7 }}>{data.launch.nextAction.description}</p>

          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: '#FCFBF8', border: '1px solid #EEE7DD', fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
            <strong style={{ color: '#1C1917' }}>Current health:</strong> {healthLine}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <a href={data.launch.nextAction.href} style={secondaryLinkStyle}>{data.launch.nextAction.cta}</a>
            {data.launch.liveStorefrontUrl ? (
              <a href={data.launch.liveStorefrontUrl} target="_blank" rel="noreferrer" style={secondaryLinkStyle}>Open live storefront</a>
            ) : null}
          </div>

          {data.launch.blockers.length > 0 ? (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F2EAE1' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 8 }}>
                Current blockers
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#57534E', fontSize: 13, lineHeight: 1.8 }}>
                {data.launch.blockers.slice(0, 3).map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div style={{ border: '1px solid #E7E5E4', borderRadius: 18, padding: 18, background: '#FCFBF8' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 12 }}>
            Readiness map
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {sections.map((section) => (
              <a
                key={section.label}
                href={section.href}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  textDecoration: 'none',
                  borderRadius: 14,
                  border: '1px solid #E7E5E4',
                  background: '#FFFFFF',
                  padding: '11px 13px',
                  color: '#1C1917',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: section.ready ? '#16A34A' : '#D97706', display: 'inline-block' }} />
                  {section.label}
                </span>
                <span style={{ fontSize: 12, color: section.ready ? '#166534' : '#9A3412', fontWeight: 700 }}>
                  {section.ready ? 'Ready' : 'Needs work'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
