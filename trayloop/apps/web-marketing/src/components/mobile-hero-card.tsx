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

/* One-tap example prompts — auto-fill and auto-submit */
const EXAMPLE_CHIPS: { label: string; prompt: string }[] = [
  { label: '🍕 Pizza · $8k/mo', prompt: 'Pizza restaurant doing about $8,000/month on EzCater' },
  { label: '🌮 Food truck · $15k/mo', prompt: 'Mexican food truck doing $15,000/month in catering, mostly direct' },
  { label: '🏢 Catering co · $40k/mo', prompt: 'Full-service catering company doing $40,000/month, no marketplace' },
  { label: '🍔 BBQ · $20k/mo', prompt: 'BBQ restaurant in Austin doing $20,000/month on EzCater and DoorDash Work' },
];

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
 * Compact AI Calculator for the mobile hero.
 * Shares the /api/ai-calculator endpoint with the desktop SavingsCalculator.
 * Sized so the headline + CTAs can still fit above the fold on a typical
 * 6.1" phone viewport.
 */
export default function MobileHeroCard() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
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
        body: JSON.stringify({ prompt: trimmed }),
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

  function handleAnalyze() {
    void runAnalysis(prompt);
  }

  function runExample(examplePrompt: string) {
    setPrompt(examplePrompt);
    void runAnalysis(examplePrompt);
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  const youKeepMarketplace = result ? result.monthlyRevenue - result.marketplaceLossMonthly : 0;
  const youKeepTrayloop = result ? result.monthlyRevenue - result.trayLoopCost : 0;

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 320,
        margin: '0 auto',
        padding: '8px 0 16px',
      }}
    >
      <style>{`
        @keyframes mhcFadeUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes mhcPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
          40% { transform: scale(1); opacity: 1; }
        }
        .mhc-fade { animation: mhcFadeUp 0.4s ease-out; }
        .mhc-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mhc-dots span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          animation: mhcPulse 1s infinite ease-in-out;
        }
        .mhc-dots span:nth-child(2) { animation-delay: 0.15s; }
        .mhc-dots span:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Subtle teal glow behind card */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(66,217,160,0.12) 0%, rgba(66,217,160,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Calculator card — compact */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: C.white,
          borderRadius: 16,
          border: `1px solid ${C.creamDark}`,
          padding: 16,
          boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header: AI badge + GPT-4o */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: C.ink,
              borderRadius: 999,
              padding: '3px 9px',
            }}
          >
            <span style={{ fontSize: 9, color: C.orange }}>✨</span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: C.white,
                letterSpacing: '0.04em',
              }}
            >
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
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.ink,
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
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
              disabled={loading}
              style={{
                width: '100%',
                resize: 'none',
                minHeight: 68,
                borderRadius: 10,
                border: `1.5px solid ${error ? '#F4B7AA' : C.creamDark}`,
                backgroundColor: C.cream,
                color: C.ink,
                fontSize: 12,
                lineHeight: 1.5,
                padding: '10px 12px',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: 8,
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
              }}
            />

            {/* One-tap example chips — auto-fill + analyze */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 10,
              }}
            >
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => runExample(chip.prompt)}
                  disabled={loading}
                  style={{
                    flex: '1 1 auto',
                    border: `1px solid ${C.creamDark}`,
                    borderRadius: 999,
                    padding: '7px 10px',
                    backgroundColor: C.cream,
                    color: C.ink,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {error ? (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#C74D36',
                  marginBottom: 8,
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
                padding: '12px 14px',
                fontSize: 13,
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                backgroundColor: loading ? C.ink : C.orange,
                color: C.white,
                marginBottom: 8,
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    justifyContent: 'center',
                  }}
                >
                  <span className="mhc-dots" aria-hidden="true">
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
                gap: 10,
                fontSize: 9,
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
            {/* Result state — State 4 compact */}
            <div
              className="mhc-fade"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: C.cream,
                borderRadius: 8,
                padding: '6px 10px',
                marginBottom: 8,
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
                  maxWidth: 210,
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

            {/* AI insight card */}
            <div
              className="mhc-fade"
              style={{
                backgroundColor: C.ink,
                borderRadius: 12,
                padding: '11px 13px',
                marginBottom: 8,
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
                <span style={{ fontSize: 9, color: C.orange }}>✨</span>
                <span
                  style={{
                    fontSize: 8,
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
                  fontSize: 11,
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
              className="mhc-fade"
              style={{
                backgroundColor: '#FEF2F0',
                border: '1px solid #FCDDD8',
                borderRadius: 10,
                padding: '9px 11px',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: C.muted,
                  letterSpacing: '0.04em',
                  marginBottom: 3,
                }}
              >
                {result.marketplace
                  ? `WITH ${result.marketplace.toUpperCase()}`
                  : 'WITH MARKETPLACE'}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
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
                <span style={{ fontSize: 10, fontWeight: 700, color: C.ink }}>You keep</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>
                  {formatCurrency(youKeepMarketplace)}
                </span>
              </div>
            </div>

            {/* TrayLoop card */}
            <div
              className="mhc-fade"
              style={{
                backgroundColor: '#EAFAF3',
                border: `2px solid ${C.teal}`,
                borderRadius: 10,
                padding: '9px 11px',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: '#1D7A55',
                  letterSpacing: '0.04em',
                  marginBottom: 3,
                }}
              >
                WITH TRAYLOOP
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
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
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1D7A55' }}>You keep</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1D7A55' }}>
                  {formatCurrency(youKeepTrayloop)}
                </span>
              </div>
            </div>

            {/* Punchline */}
            {result.monthlySavings > 0 ? (
              <div
                className="mhc-fade"
                style={{
                  backgroundColor: '#1D7A55',
                  borderRadius: 12,
                  padding: '12px 14px',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#A8E6CE',
                    marginBottom: 1,
                  }}
                >
                  You&apos;d keep
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
                  {formatCurrency(result.monthlySavings)} more
                </div>
                <div style={{ fontSize: 10, color: '#A8E6CE', marginTop: 2 }}>
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
                fontSize: 12,
                fontWeight: 800,
                padding: '12px 14px',
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
