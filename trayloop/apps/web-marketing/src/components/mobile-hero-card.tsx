'use client';

import { useState } from 'react';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
  red: '#FF6243',
};

interface AiCalculatorResult {
  monthlyRevenue: number;
  commissionRate: number;
  businessType: string;
  location: string | null;
  marketplace: string | null;
  marketplaceLossMonthly: number;
  trayLoopCost: number;
  monthlySavings: number;
  annualSavings: number;
  insight: string;
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/**
 * Compact AI Calculator optimized for the mobile hero — opening image on phones.
 * Shares the same API (/api/ai-calculator) as the desktop SavingsCalculator.
 * Designed so headline + CTAs + this card all fit above the fold on a 6.1" phone.
 */
export default function MobileHeroCard() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!prompt.trim()) {
      setError('Tell us about your catering business.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const payload = (await response.json()) as AiCalculatorResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'We could not analyze your business.');
      }

      setResult(payload);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'We could not analyze your business.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 340,
        margin: '0 auto',
        padding: '12px 0 24px',
      }}
    >
      <style>{`
        @keyframes mhFadeUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes mhPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
          40% { transform: scale(1); opacity: 1; }
        }
        .mh-new { animation: mhFadeUp 0.4s ease-out; }
        .mh-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mh-dots span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          animation: mhPulse 1s infinite ease-in-out;
        }
        .mh-dots span:nth-child(2) { animation-delay: 0.15s; }
        .mh-dots span:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Decorative teal radial glow */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(66,217,160,0.12) 0%, rgba(66,217,160,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Calculator card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: C.white,
          borderRadius: 18,
          border: `1px solid ${C.creamDark}`,
          padding: 18,
          boxShadow: '0 12px 36px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header: AI badge + powered-by */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: C.ink,
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            <span style={{ fontSize: 10, color: C.orange }}>✨</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: C.white, letterSpacing: '0.04em' }}>
              AI CALCULATOR
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: C.teal,
              }}
            />
            <span style={{ fontSize: 9, fontWeight: 500, color: C.muted }}>GPT-4o</span>
          </div>
        </div>

        {!result ? (
          <>
            {/* Empty / prompt state */}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
              What are marketplaces costing you?
            </div>

            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              placeholder='"BBQ restaurant in Austin, $12k/mo on EzCater"'
              rows={3}
              style={{
                width: '100%',
                resize: 'none',
                minHeight: 72,
                borderRadius: 10,
                border: `1.5px solid ${error ? '#F4B7AA' : C.creamDark}`,
                backgroundColor: C.cream,
                color: C.ink,
                fontSize: 13,
                lineHeight: 1.5,
                padding: '12px 14px',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />

            {error ? (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#C74D36',
                  marginBottom: 10,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: 10,
                padding: '13px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                backgroundColor: C.orange,
                color: C.white,
                opacity: loading ? 0.85 : 1,
                marginBottom: 10,
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="mh-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Analyzing...
                </span>
              ) : (
                '✨ Analyze with AI →'
              )}
            </button>

            {/* Trust row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                fontSize: 10,
                color: C.muted,
                fontWeight: 500,
              }}
            >
              <span>🔒 No email</span>
              <span>⚡ 2 sec</span>
              <span>💯 Free</span>
            </div>
          </>
        ) : (
          <>
            {/* Result state (State 4) — compact version */}
            <div
              className="mh-new"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: C.cream,
                borderRadius: 8,
                padding: '6px 10px',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: C.muted,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 220,
                }}
              >
                💬 {result.businessType}
                {result.location ? ` · ${result.location}` : ''}
              </span>
              <button
                type="button"
                onClick={reset}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: C.orange,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Edit
              </button>
            </div>

            {/* AI insight */}
            <div
              className="mh-new"
              style={{
                backgroundColor: C.ink,
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, color: C.orange }}>✨</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: C.orange,
                    letterSpacing: '0.05em',
                  }}
                >
                  AI ANALYSIS
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: C.white,
                  fontWeight: 500,
                }}
              >
                {result.insight}
              </div>
            </div>

            {/* Marketplace card */}
            <div
              className="mh-new"
              style={{
                backgroundColor: '#FEF2F0',
                border: '1px solid #FCDDD8',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: C.muted,
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}
              >
                {result.marketplace ? `WITH ${result.marketplace.toUpperCase()}` : 'WITH MARKETPLACE'}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: C.muted,
                  marginBottom: 2,
                }}
              >
                <span>Commission ({result.commissionRate}%)</span>
                <span style={{ fontWeight: 700, color: C.red }}>
                  -{formatCurrency(result.marketplaceLossMonthly)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #F5CCC5',
                  paddingTop: 4,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>You keep</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>
                  {formatCurrency(result.monthlyRevenue - result.marketplaceLossMonthly)}
                </span>
              </div>
            </div>

            {/* TrayLoop card */}
            <div
              className="mh-new"
              style={{
                backgroundColor: '#EAFAF3',
                border: `2px solid ${C.teal}`,
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#1D7A55',
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}
              >
                WITH TRAYLOOP
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: C.muted,
                  marginBottom: 2,
                }}
              >
                <span>Flat fee</span>
                <span style={{ fontWeight: 700, color: '#1D7A55' }}>
                  -{formatCurrency(result.trayLoopCost)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #B8E8D4',
                  paddingTop: 4,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D7A55' }}>You keep</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1D7A55' }}>
                  {formatCurrency(result.monthlyRevenue - result.trayLoopCost)}
                </span>
              </div>
            </div>

            {/* Punchline */}
            {result.monthlySavings > 0 ? (
              <div
                className="mh-new"
                style={{
                  backgroundColor: '#1D7A55',
                  borderRadius: 12,
                  padding: '14px 16px',
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: '#A8E6CE', marginBottom: 2 }}>
                  You&apos;d keep
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
                  {formatCurrency(result.monthlySavings)} more
                </div>
                <div style={{ fontSize: 11, color: '#A8E6CE', marginTop: 2 }}>
                  every month — {formatCurrency(result.annualSavings)}/year
                </div>
              </div>
            ) : null}

            {/* CTA */}
            <a
              href="https://dashboard.trayloophq.com/register"
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                backgroundColor: C.orange,
                color: C.white,
                fontSize: 13,
                fontWeight: 800,
                padding: '13px 16px',
                borderRadius: 10,
              }}
            >
              Start Keeping My Revenue →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
