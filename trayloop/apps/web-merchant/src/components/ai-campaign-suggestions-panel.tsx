'use client';

import type { SummaryMetric } from './automation-engine-panel';
import { formatCurrency } from '../lib/format';

export interface AiSalesSuggestion {
  id: string;
  title: string;
  audience: string;
  reason: string;
  summary: string;
  targetCount: number;
  estimatedRevenueCents: number;
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
  locked: boolean;
  inspectHref: string;
  inspectLabel: string;
}

export interface AiSalesPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  metrics: SummaryMetric[];
  suggestions: AiSalesSuggestion[];
  engineRequiredLabel: string;
  engineRequiredNote: string;
}

function copyToClipboard(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return;
  void navigator.clipboard.writeText(text);
}

export default function AiSalesPanel({
  eyebrow,
  title,
  description,
  metrics,
  suggestions,
  engineRequiredLabel,
  engineRequiredNote,
}: AiSalesPanelProps) {
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
      <div style={{ padding: 28, borderBottom: '1px solid #F5F5F4' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 999,
            background: '#FFF7ED',
            color: '#C2410C',
            padding: '7px 12px',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                fontFamily: 'var(--font-display), var(--font-body), sans-serif',
              }}
            >
              {title}
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.7, color: '#78716C', maxWidth: 760 }}>
              {description}
            </p>
          </div>
          <div
            style={{
              borderRadius: 18,
              border: '1px solid #FDE68A',
              background: '#FFFBEB',
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: '#92400E',
            }}
          >
            {engineRequiredLabel}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 20 }}>
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 18,
                border: '1px solid #E7E5E4',
                background: '#FAFAF9',
                padding: '14px 14px 12px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', fontWeight: 800 }}>
                {metric.label}
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: '#1C1917' }}>
                {metric.value}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>
                {metric.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 28, display: 'grid', gap: 14 }}>
        <div
          style={{
            borderRadius: 22,
            border: '1px solid #FDE68A',
            background: '#FFFBEB',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#92400E' }}>{engineRequiredLabel}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#B45309', lineHeight: 1.6 }}>
              {engineRequiredNote}
            </div>
          </div>
          <button
            type="button"
            disabled
            style={{
              borderRadius: 14,
              border: 'none',
              background: '#D6D3D1',
              color: '#FFFFFF',
              height: 44,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'not-allowed',
            }}
          >
            Launch Engine locked
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {suggestions.map((suggestion) => {
            const lockLabel = suggestion.locked ? 'Engine required' : 'Ready';
            return (
              <article
                key={suggestion.id}
                style={{
                  border: '1px solid #E7E5E4',
                  borderRadius: 22,
                  padding: 18,
                  background: '#FFFFFF',
                  boxShadow: '0 10px 24px rgba(28,25,23,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, maxWidth: 760 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {suggestion.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            borderRadius: 999,
                            background: '#F5F5F4',
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            color: '#57534E',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      <span
                        style={{
                          borderRadius: 999,
                          background: suggestion.locked ? '#FEF3C7' : '#ECFDF5',
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          color: suggestion.locked ? '#92400E' : '#166534',
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {lockLabel}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                      {suggestion.title}
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.7, color: '#57534E' }}>
                      {suggestion.summary}
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: '#78716C' }}>
                      {suggestion.audience}
                    </p>
                    <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.6, color: '#1C1917', fontWeight: 600 }}>
                      {suggestion.reason}
                    </p>
                  </div>

                  <div
                    style={{
                      minWidth: 220,
                      borderRadius: 18,
                      border: '1px solid #E7E5E4',
                      background: '#FAFAF9',
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', fontWeight: 800 }}>
                      Estimated outcome
                    </div>
                    <div style={{ marginTop: 8, fontSize: 28, lineHeight: 1, fontWeight: 800, color: '#1C1917' }}>
                      {formatCurrency(suggestion.estimatedRevenueCents)}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>
                      {suggestion.targetCount} targets
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${suggestion.title}\n${suggestion.audience}\n${suggestion.reason}\nPotential: ${formatCurrency(
                          suggestion.estimatedRevenueCents,
                        )}`,
                      )
                    }
                    style={{
                      borderRadius: 14,
                      border: '1px solid #E7E5E4',
                      background: '#FFFFFF',
                      color: '#57534E',
                      height: 42,
                      padding: '0 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Copy brief
                  </button>
                  <a
                    href={suggestion.inspectHref}
                    style={{
                      borderRadius: 14,
                      border: '1px solid #E7E5E4',
                      background: '#FFFFFF',
                      color: '#57534E',
                      height: 42,
                      padding: '0 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    {suggestion.inspectLabel}
                  </a>
                  <button
                    type="button"
                    disabled
                    style={{
                      marginLeft: 'auto',
                      borderRadius: 14,
                      border: 'none',
                      background: '#D6D3D1',
                      color: '#FFFFFF',
                      height: 42,
                      padding: '0 16px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'not-allowed',
                    }}
                  >
                    Engine required to launch
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
