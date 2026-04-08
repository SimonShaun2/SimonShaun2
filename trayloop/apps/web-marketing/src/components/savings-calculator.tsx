'use client';

import { useMemo, useState } from 'react';
import PillButton from '@/components/pill-button';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

const EXAMPLE_PROMPTS = [
  'I run a pizza shop in Dallas doing about $8k/mo on EzCater',
  'I run a food truck in Houston doing around $15k/mo in catering through DoorDash Work',
  'I run a catering company in Chicago doing about $40k/mo on EzCater',
  'I run a BBQ restaurant in Austin doing around $20k/mo on EzCater',
] as const;

const EXAMPLE_CHIPS = [
  '🍕 Pizza · $8k/mo',
  '🌮 Food truck · $15k/mo',
  '🏢 Catering co · $40k/mo',
  '🍔 BBQ · $20k/mo',
] as const;

type CalculatorMode = 'ai' | 'manual';

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

function buildPromptRecap(result: AiCalculatorResult) {
  const pieces = [
    result.businessType,
    result.location,
    result.monthlyRevenue > 0 ? formatCurrency(result.monthlyRevenue).replace('.00', '') : null,
    result.marketplace,
  ].filter(Boolean);

  return pieces.join(' · ');
}

function ResultCards({
  revenue,
  feePercent,
  marketplaceLossMonthly,
  trayLoopCost,
  monthlySavings,
  annualSavings,
  insight,
  marketplace,
}: {
  revenue: number;
  feePercent: number;
  marketplaceLossMonthly: number;
  trayLoopCost: number;
  monthlySavings: number;
  annualSavings: number;
  insight?: string;
  marketplace?: string | null;
}) {
  const youKeepMarketplace = revenue - marketplaceLossMonthly;
  const youKeepTrayloop = revenue - trayLoopCost;
  const marketplaceLabel = marketplace ? `With ${marketplace}` : 'With marketplace';

  return (
    <>
      {insight ? (
        <div
          style={{
            marginBottom: 18,
            borderRadius: 18,
            padding: '20px 22px',
            backgroundColor: C.ink,
            boxShadow: '0 16px 36px rgba(26,22,18,0.16)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.orange,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            ✨ AI analysis
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.65, color: C.white }}>{insight}</div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: '1 1 240px',
            borderRadius: 18,
            padding: '20px',
            backgroundColor: '#FEF2F0',
            border: '1px solid #F7D3CB',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {marketplaceLabel}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Revenue</span>
            <span style={{ fontSize: 13, color: C.ink }}>{formatCurrency(revenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Commission ({feePercent}%)</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#E1452A' }}>
              -{formatCurrency(marketplaceLossMonthly)}
            </span>
          </div>
          <div
            style={{
              borderTop: '1px solid #F1C5BC',
              paddingTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>You keep</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>
              {formatCurrency(youKeepMarketplace)}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: '1 1 240px',
            borderRadius: 18,
            padding: '20px',
            backgroundColor: '#EAFAF3',
            border: `2px solid ${C.teal}`,
            boxShadow: '0 6px 18px rgba(66,217,160,0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            With TrayLoop
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Revenue</span>
            <span style={{ fontSize: 13, color: C.ink }}>{formatCurrency(revenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Flat fee</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1D7A55' }}>
              -{formatCurrency(trayLoopCost)}
            </span>
          </div>
          <div
            style={{
              borderTop: '1px solid #B8E8D4',
              paddingTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1D7A55' }}>You keep</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1D7A55' }}>
              {formatCurrency(youKeepTrayloop)}
            </span>
          </div>
        </div>
      </div>

      {monthlySavings > 0 ? (
        <div
          style={{
            backgroundColor: '#1D7A55',
            borderRadius: 18,
            padding: '26px 28px',
            textAlign: 'center',
            marginBottom: 22,
            boxShadow: '0 16px 40px rgba(29,122,85,0.22)',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#A8E6CE', marginBottom: 6 }}>You&apos;d keep</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.05 }}>
            {formatCurrency(monthlySavings)} more
          </div>
          <div style={{ fontSize: 16, color: '#CFEFDF', marginTop: 6 }}>
            every month — {formatCurrency(annualSavings)} per year
          </div>
        </div>
      ) : null}

      <div style={{ textAlign: 'center' }}>
        <PillButton
          text="Start Keeping Your Revenue →"
          href="https://dashboard.trayloophq.com/register"
          variant="primary"
        />
      </div>
    </>
  );
}

export default function SavingsCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('ai');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState('5000');
  const [feePercent, setFeePercent] = useState(20);

  const vol = parseFloat(revenue.replace(/[^0-9.]/g, '')) || 0;
  const theyTake = Math.round(vol * (feePercent / 100));
  const extraPerMonth = theyTake - 49;
  const extraPerYear = extraPerMonth * 12;
  const characterCount = prompt.trim().length;

  const promptRecap = useMemo(() => (result ? buildPromptRecap(result) : ''), [result]);

  async function handleAnalyze() {
    if (!prompt.trim()) {
      setError('Tell us about your catering business so we can analyze it.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const payload = (await response.json()) as AiCalculatorResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'We could not analyze your business right now.');
      }

      setResult(payload);
    } catch (analysisError) {
      setResult(null);
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : 'We could not analyze your business right now.',
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAiState() {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  function switchToManual() {
    setMode('manual');
    setLoading(false);
    setResult(null);
  }

  return (
    <div
      id="calculator"
      style={{
        backgroundColor: C.white,
        borderRadius: 24,
        padding: '28px 28px 30px',
        border: `1px solid ${C.creamDark}`,
        maxWidth: 720,
        margin: '0 auto',
        boxShadow: '0 18px 52px rgba(19, 16, 11, 0.08)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: C.cream,
            borderRadius: 999,
            padding: 4,
            border: `1px solid ${C.creamDark}`,
            gap: 4,
          }}
        >
          {(['ai', 'manual'] as const).map((nextMode) => {
            const active = mode === nextMode;

            return (
              <button
                key={nextMode}
                type="button"
                onClick={() => setMode(nextMode)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: active ? C.ink : 'transparent',
                  color: active ? C.white : C.muted,
                  transition: 'all 160ms ease',
                }}
              >
                {nextMode === 'ai' ? '✨ AI' : 'Manual'}
              </button>
            );
          })}
        </div>

        {mode === 'ai' ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '8px 12px',
              backgroundColor: C.cream,
              border: `1px solid ${C.creamDark}`,
              fontSize: 12,
              fontWeight: 700,
              color: C.ink,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="calculator-teal-dot"
              style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.teal, flexShrink: 0 }}
            />
            Powered by GPT-4o
          </div>
        ) : null}
      </div>

      {mode === 'ai' ? (
        <>
          {result ? (
            <>
              <div
                style={{
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  backgroundColor: C.cream,
                  border: `1px solid ${C.creamDark}`,
                  borderRadius: 999,
                  padding: '12px 14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.ink, minWidth: 0 }}>
                  <span style={{ fontSize: 15 }}>💬</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {promptRecap}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetAiState}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: C.orange,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>

              <ResultCards
                revenue={result.monthlyRevenue}
                feePercent={result.commissionRate}
                marketplaceLossMonthly={result.marketplaceLossMonthly}
                trayLoopCost={result.trayLoopCost}
                monthlySavings={result.monthlySavings}
                annualSavings={result.annualSavings}
                insight={result.insight}
                marketplace={result.marketplace}
              />
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 6, textAlign: 'center' }}>
                What are marketplaces costing you?
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: C.muted,
                  marginBottom: 24,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Tell us about your business. The AI handles the math.
              </p>

              <div style={{ marginBottom: 14 }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g. "I run a BBQ restaurant in Austin doing about $12k/mo on EzCater"'
                  rows={5}
                  disabled={loading}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    minHeight: 150,
                    borderRadius: 18,
                    border: `2px solid ${error ? '#F4B7AA' : C.creamDark}`,
                    backgroundColor: C.cream,
                    color: C.ink,
                    fontSize: 16,
                    lineHeight: 1.65,
                    padding: '18px 20px',
                    outline: 'none',
                    opacity: loading ? 0.62 : 1,
                    transition: 'opacity 160ms ease, border-color 160ms ease',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: error ? '#C74D36' : C.muted }}>
                    {error ?? 'Describe your marketplace, business type, and monthly catering revenue.'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{characterCount} characters</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                {EXAMPLE_CHIPS.map((chip, index) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setPrompt(EXAMPLE_PROMPTS[index]);
                      setError(null);
                    }}
                    style={{
                      border: `1px solid ${C.creamDark}`,
                      borderRadius: 999,
                      padding: '10px 14px',
                      backgroundColor: C.cream,
                      color: C.ink,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: 999,
                  padding: '17px 24px',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  backgroundColor: loading ? C.ink : C.orange,
                  color: C.white,
                  transition: 'background-color 160ms ease',
                  boxShadow: loading ? 'none' : '0 10px 24px rgba(232, 86, 24, 0.22)',
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <span className="calculator-loading-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    Analyzing your business...
                  </span>
                ) : error ? (
                  'Try Again →'
                ) : (
                  '✨ Analyze with AI →'
                )}
              </button>

              {loading ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  Parsing business type ✓ · Looking up marketplace fees ✓ · Calculating savings...
                </div>
              ) : null}

              {!loading && error ? (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={switchToManual}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: C.orange,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Or switch to manual →
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    fontSize: 12,
                    color: C.muted,
                    textAlign: 'center',
                  }}
                >
                  <span>🔒 No email required</span>
                  <span>⚡ Results in 2 seconds</span>
                  <span>💯 Completely free</span>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4, textAlign: 'center' }}>
            What are marketplaces costing you?
          </h3>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, textAlign: 'center' }}>
            Enter your numbers. See what you keep.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: 'block', marginBottom: 8 }}
            >
              Your monthly catering revenue
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: C.cream,
                borderRadius: 12,
                padding: '16px 20px',
                border: `2px solid ${C.creamDark}`,
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: C.ink, marginRight: 2 }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="5,000"
                value={revenue ? Number(revenue).toLocaleString() : ''}
                onChange={(e) => setRevenue(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  fontWeight: 700,
                  color: C.ink,
                  fontSize: 28,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
            >
              <label style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                Marketplace commission rate
              </label>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.orange }}>{feePercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              value={feePercent}
              onChange={(e) => setFeePercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.orange, height: 6 }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: C.muted,
                marginTop: 4,
              }}
            >
              <span>10%</span>
              <span>30%</span>
            </div>
          </div>

          {vol > 0 ? (
            <ResultCards
              revenue={vol}
              feePercent={feePercent}
              marketplaceLossMonthly={theyTake}
              trayLoopCost={49}
              monthlySavings={extraPerMonth}
              annualSavings={extraPerYear}
            />
          ) : null}
        </>
      )}

      <style jsx>{`
        .calculator-loading-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .calculator-loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          animation: calculator-pulse 1s infinite ease-in-out;
        }

        .calculator-loading-dots span:nth-child(2) {
          animation-delay: 0.14s;
        }

        .calculator-loading-dots span:nth-child(3) {
          animation-delay: 0.28s;
        }

        .calculator-teal-dot {
          animation: calculator-teal-pulse 1.8s ease-in-out infinite;
        }

        @keyframes calculator-pulse {
          0%,
          80%,
          100% {
            transform: scale(0.7);
            opacity: 0.45;
          }

          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes calculator-teal-pulse {
          0%,
          100% {
            opacity: 0.5;
            box-shadow: 0 0 0 0 rgba(66, 217, 160, 0.3);
          }

          50% {
            opacity: 1;
            box-shadow: 0 0 0 8px rgba(66, 217, 160, 0);
          }
        }

        @media (max-width: 640px) {
          #calculator {
            padding: 22px 18px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
