'use client';

import { useLaunchStatus } from '../lib/use-launch-status';
import { getLaunchHealthLine, getLaunchReadinessRows } from '../lib/launch-story';
import LaunchApprovalCard from './launch-approval-card';

export default function LaunchShellAside() {
  const { data, loading, error } = useLaunchStatus();

  if (data && data.launch.blockers.length === 0) {
    return null;
  }

  return (
    <aside style={{ width: 320, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 28, display: 'grid', gap: 16 }}>
        <section style={cardStyle}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', marginBottom: 10 }}>
            Launch status
          </div>
          {loading && !data ? (
            <div style={{ fontSize: 13, color: '#78716C' }}>Loading launch status...</div>
          ) : error || !data ? (
            <div style={{ fontSize: 13, color: '#B91C1C' }}>{error || 'Unable to load launch status.'}</div>
          ) : (
            <>
              {(() => {
                const readinessRows = getLaunchReadinessRows(data);
                const healthLine = getLaunchHealthLine(data);

                return (
                  <>
              <div style={{ fontSize: 24, lineHeight: 1.04, letterSpacing: '-0.05em', fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontWeight: 800, color: '#1C1917' }}>
                {data.launch.nextAction.title}
              </div>
              <p style={{ margin: '8px 0 0', color: '#57534E', fontSize: 13, lineHeight: 1.7 }}>
                {data.launch.nextAction.description}
              </p>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#78716C' }}>Launch score</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1C1917' }}>{data.launch.progressPercent}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: '#EEE7DD', overflow: 'hidden' }}>
                <div style={{ width: `${data.launch.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #E85618 0%, #D4A853 100%)', borderRadius: 999 }} />
                </div>
              </div>

              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: '#FCFBF8', border: '1px solid #EEE7DD', fontSize: 12, color: '#57534E', lineHeight: 1.6 }}>
                <strong style={{ color: '#1C1917' }}>Health:</strong> {healthLine}
              </div>

              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {readinessRows.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 12,
                      border: '1px solid #E7E5E4',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: row.ready ? '#16A34A' : '#D97706', display: 'inline-block' }} />
                      {row.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: row.ready ? '#166534' : '#9A3412' }}>
                      {row.ready ? 'Ready' : 'Needs work'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <a href="/launch" style={primaryLinkStyle}>Open launch center</a>
                <a href={data.launch.nextAction.href} style={secondaryLinkStyle}>{data.launch.nextAction.cta}</a>
              </div>
                  </>
                );
              })()}
            </>
          )}
        </section>

        {data ? <LaunchApprovalCard launchStatus={data} compact /> : null}
      </div>
    </aside>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 18,
  background: '#FFFFFF',
  padding: 18,
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
