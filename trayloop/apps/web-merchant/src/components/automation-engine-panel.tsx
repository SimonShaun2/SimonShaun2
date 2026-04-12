'use client';

type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'locked';

export interface SummaryMetric {
  label: string;
  value: string;
  note: string;
  tone?: Tone;
}

export interface AutomationSummaryPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  metrics: SummaryMetric[];
  primaryAction?: {
    label: string;
    href: string;
    note?: string;
    locked?: boolean;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  status?: {
    label: string;
    note: string;
    tone?: Tone;
  };
  blockers?: string[];
}

const TONES: Record<Tone, { bg: string; border: string; text: string }> = {
  neutral: { bg: '#FAFAF9', border: '#E7E5E4', text: '#1C1917' },
  accent: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  good: { bg: '#ECFDF5', border: '#A7F3D0', text: '#166534' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  locked: { bg: '#F5F5F4', border: '#D6D3D1', text: '#57534E' },
};

function toneStyle(tone: Tone = 'neutral') {
  return TONES[tone];
}

export default function AutomationSummaryPanel({
  eyebrow,
  title,
  description,
  metrics,
  primaryAction,
  secondaryAction,
  status,
  blockers,
}: AutomationSummaryPanelProps) {
  const statusTone = toneStyle(status?.tone ?? (primaryAction?.locked ? 'locked' : 'good'));

  return (
    <section
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 28,
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.9fr)',
          gap: 24,
          padding: 28,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: '#FFF2E8',
              color: '#E85618',
              padding: '7px 12px',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              margin: '12px 0 0',
              fontSize: 34,
              lineHeight: 1.02,
              letterSpacing: '-0.05em',
              fontFamily: 'var(--font-display), var(--font-body), sans-serif',
            }}
          >
            {title}
          </h1>
          <p style={{ margin: '10px 0 0', color: '#78716C', fontSize: 15, lineHeight: 1.7, maxWidth: 720 }}>
            {description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 24 }}>
            {metrics.map((metric) => {
              const colors = toneStyle(metric.tone);
              return (
                <div
                  key={metric.label}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 20,
                    padding: '16px 16px 14px',
                    background: colors.bg,
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', fontWeight: 800 }}>
                    {metric.label}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, lineHeight: 1, fontWeight: 800, color: colors.text }}>
                    {metric.value}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>
                    {metric.note}
                  </div>
                </div>
              );
            })}
          </div>

          {blockers && blockers.length > 0 ? (
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {blockers.map((blocker) => (
                <span
                  key={blocker}
                  style={{
                    borderRadius: 999,
                    border: '1px solid #E7E5E4',
                    background: '#FAFAF9',
                    padding: '7px 10px',
                    fontSize: 12,
                    color: '#57534E',
                    fontWeight: 600,
                  }}
                >
                  {blocker}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <aside
          style={{
            borderRadius: 22,
            border: `1px solid ${statusTone.border}`,
            background: statusTone.bg,
            padding: 18,
            alignSelf: 'start',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: '#FFFFFF',
              border: `1px solid ${statusTone.border}`,
              padding: '7px 11px',
              fontSize: 12,
              fontWeight: 800,
              color: statusTone.text,
            }}
          >
            {status?.label ?? (primaryAction?.locked ? 'Engine required' : 'Ready')}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.7, color: '#57534E' }}>
            {status?.note ?? (primaryAction?.locked ? 'Activation stays locked until Engine is enabled.' : 'This workspace is ready to act.')}
          </p>

          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {primaryAction ? (
              primaryAction.locked ? (
                <button
                  type="button"
                  disabled
                  style={{
                    height: 46,
                    borderRadius: 14,
                    border: 'none',
                    background: '#D6D3D1',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'not-allowed',
                  }}
                >
                  {primaryAction.label}
                </button>
              ) : (
                <a
                  href={primaryAction.href}
                  style={{
                    height: 46,
                    borderRadius: 14,
                    border: 'none',
                    background: '#1C1917',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {primaryAction.label}
                </a>
              )
            ) : null}

            {secondaryAction ? (
              <a
                href={secondaryAction.href}
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: '1px solid #E7E5E4',
                  background: '#FFFFFF',
                  color: '#57534E',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                  textDecoration: 'none',
                }}
              >
                {secondaryAction.label}
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
