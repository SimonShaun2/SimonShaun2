'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

/* ── Palette ── */
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

/* ── Shared helpers ── */
const section = (extra: CSSProperties = {}): CSSProperties => ({
  maxWidth: 1120,
  margin: '0 auto',
  padding: '80px 24px',
  ...extra,
});

const label: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.orange,
  marginBottom: 12,
};

const h2: CSSProperties = {
  fontSize: 40,
  fontWeight: 800,
  lineHeight: 1.15,
  color: C.ink,
  marginBottom: 16,
};

const sub: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.6,
  color: C.muted,
  maxWidth: 600,
};

const card = (extra: CSSProperties = {}): CSSProperties => ({
  backgroundColor: C.white,
  borderRadius: 16,
  padding: 32,
  ...extra,
});

const tealDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: C.teal,
  flexShrink: 0,
  marginTop: 7,
};

/* ── FAQ data ── */
const faqs = [
  {
    q: 'Can I still use marketplaces alongside TrayLoop?',
    a: 'Absolutely. TrayLoop is additive, not a replacement. Keep your existing marketplace presence while building a direct channel that you own and control.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'There are no contracts and no cancellation fees. You can cancel any time from your dashboard. Your storefront stays live through the end of your billing period.',
  },
  {
    q: 'How fast can I go live?',
    a: 'Most restaurants are live within 48 hours. Our team handles menu setup, branding, and technical configuration so you can focus on cooking.',
  },
  {
    q: 'What does the 5% processing fee cover?',
    a: 'The 5% covers credit card processing, payment infrastructure, and fraud protection. There are no hidden add-ons — that is the full cost.',
  },
  {
    q: 'Are there any other fees?',
    a: 'No. $49/month + 5% processing is the complete cost. No setup fees, no per-order fees, no commission, and no surprise charges.',
  },
  {
    q: 'What if I have low catering volume right now?',
    a: 'TrayLoop is designed to help you grow. Even at a few orders per month the math works in your favor versus marketplace commissions. Plus our AI re-engagement tools help bring past customers back automatically.',
  },
];

/* ── Feature list for plan card ── */
const features = [
  'Branded catering storefront',
  'Custom menu & pricing',
  'Order management dashboard',
  'AI-powered customer re-engagement',
  'Built-in payment processing',
  'Real-time order notifications',
  'Customer database & CRM',
  'Automated email confirmations',
  'Analytics & reporting',
  'White glove onboarding',
];

/* ── Component ── */
export default function PricingPage() {
  const [orders, setOrders] = useState(12);
  const [avgSize, setAvgSize] = useState(500);
  const [feePercent, setFeePercent] = useState(20);

  const monthlyVolume = orders * avgSize;
  const marketplaceLoss = monthlyVolume * (feePercent / 100);
  const trayloopCost = 49;
  const annualSavings = Math.max(0, (marketplaceLoss - trayloopCost) * 12);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <>
      {/* Responsive style overrides for grids */}
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid-2col {
            grid-template-columns: 1fr !important;
          }
          .pricing-grid-4col {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .pricing-grid-4col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ ...section(), textAlign: 'center' }}>
        <p style={label}>Pricing</p>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.1,
            color: C.ink,
            marginBottom: 20,
            maxWidth: 720,
            margin: '0 auto 20px',
          }}
        >
          One plan. One price.
          <br />
          No commissions. Ever.
        </h1>
        <p style={{ ...sub, margin: '0 auto', maxWidth: 520 }}>
          <span style={{ fontWeight: 700, color: C.ink }}>$49/month</span> +{' '}
          <span style={{ fontWeight: 700, color: C.ink }}>5% processing</span>.
          That&apos;s it. Keep the rest.
        </p>
      </section>

      {/* ── Math Comparison ── */}
      <section style={section()}>
        <div
          className="pricing-grid-2col"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {/* Left – Marketplace */}
          <div
            style={{
              ...card({ borderTop: `4px solid ${C.red}` }),
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.red,
              }}
            >
              Marketplace Platform
            </p>
            <p style={{ fontSize: 14, color: C.muted }}>
              Average commission on a $4,000 catering order
            </p>
            <p style={{ fontSize: 36, fontWeight: 800, color: C.red }}>
              -$1,000
            </p>
            <p style={{ fontSize: 14, color: C.muted }}>
              25% commission lost per order
            </p>
            <div
              style={{
                backgroundColor: '#FFF0ED',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: C.red,
                textAlign: 'center',
              }}
            >
              $12,000/year lost to commissions
            </div>
          </div>

          {/* Right – TrayLoop */}
          <div
            style={{
              ...card({ border: `2px solid ${C.teal}` }),
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.teal,
              }}
            >
              TrayLoop Direct
            </p>
            <p style={{ fontSize: 14, color: C.muted }}>
              Same $4,000 order — processing fee only
            </p>
            <p style={{ fontSize: 36, fontWeight: 800, color: C.ink }}>
              -$299
            </p>
            <p style={{ fontSize: 14, color: C.muted }}>
              $49 subscription + $200 processing (5%)
            </p>
            <div
              style={{
                backgroundColor: '#EAFAF3',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#1D7A55',
                textAlign: 'center',
              }}
            >
              Save $8,412/year
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan + Social Proof ── */}
      <section style={{ backgroundColor: C.creamDark }}>
        <div
          className="pricing-grid-2col"
          style={{
            ...section(),
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Plan card */}
          <div
            style={{
              ...card({ border: `2px solid ${C.orange}` }),
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#FFF3ED',
                color: C.orange,
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                alignSelf: 'flex-start',
              }}
            >
              Everything included
            </div>
            <div>
              <span style={{ fontSize: 48, fontWeight: 800, color: C.ink }}>
                $49
              </span>
              <span
                style={{ fontSize: 18, fontWeight: 500, color: C.muted, marginLeft: 4 }}
              >
                /month
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: C.muted,
                  display: 'block',
                  marginTop: 4,
                }}
              >
                + 5% payment processing
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={tealDot} />
                  <span style={{ fontSize: 15, color: C.ink }}>{f}</span>
                </div>
              ))}
            </div>

            <PillButton text="Get started →" href="/signup" />
          </div>

          {/* Social proof card */}
          <div
            style={{
              backgroundColor: C.ink,
              borderRadius: 16,
              padding: 32,
              color: C.white,
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.teal,
              }}
            >
              Why restaurants switch
            </p>

            {/* Testimonial 1 */}
            <div
              style={{
                borderLeft: `3px solid ${C.teal}`,
                paddingLeft: 16,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'rgba(254,252,250,0.85)',
                  fontStyle: 'italic',
                  marginBottom: 8,
                }}
              >
                &ldquo;We were giving away 25% of every catering order. TrayLoop
                paid for itself the first week.&rdquo;
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>
                Maria S. — Bella Cucina
              </p>
            </div>

            {/* Testimonial 2 */}
            <div
              style={{
                borderLeft: `3px solid ${C.teal}`,
                paddingLeft: 16,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'rgba(254,252,250,0.85)',
                  fontStyle: 'italic',
                  marginBottom: 8,
                }}
              >
                &ldquo;Our repeat catering rate doubled since we started using the
                AI re-engagement tools. Customers come back without us lifting a
                finger.&rdquo;
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>
                Marcus T. — Southside Catering
              </p>
            </div>

            {/* ROI breakdown */}
            <div
              style={{
                backgroundColor: 'rgba(66,217,160,0.1)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <p
                style={{ fontSize: 13, color: C.teal, fontWeight: 600, marginBottom: 4 }}
              >
                Average ROI
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.white }}>
                Pays for itself with one order
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guarantees ── */}
      <section style={section()}>
        <h2 style={{ ...h2, textAlign: 'center', marginBottom: 40 }}>
          Our guarantees
        </h2>
        <div
          className="pricing-grid-4col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
        >
          {[
            {
              title: 'No contracts',
              desc: 'Month-to-month. Cancel any time, no questions asked.',
            },
            {
              title: 'White glove onboarding',
              desc: 'We set up your storefront, menu, and branding for you.',
            },
            {
              title: 'Onboarding included',
              desc: 'Live walkthrough and training for you and your team.',
            },
            {
              title: 'No commissions',
              desc: 'Zero percent commission on every order, forever.',
            },
          ].map((g) => (
            <div
              key={g.title}
              style={{
                ...card(),
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <p style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>
                {g.title}
              </p>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section style={{ backgroundColor: C.creamDark }}>
        <div style={{ ...section(), textAlign: 'center' }}>
          <p style={label}>ROI Calculator</p>
          <h2 style={{ ...h2, marginBottom: 40 }}>
            See how much you could save
          </h2>

          <style>{`
            input[type="range"].roi-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 8px;
              border-radius: 4px;
              background: #E0D8CE;
              outline: none;
            }
            input[type="range"].roi-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #E85618;
              cursor: pointer;
              border: 3px solid #FEFCFA;
              box-shadow: 0 1px 4px rgba(0,0,0,0.15);
            }
            input[type="range"].roi-slider::-moz-range-thumb {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #E85618;
              cursor: pointer;
              border: 3px solid #FEFCFA;
              box-shadow: 0 1px 4px rgba(0,0,0,0.15);
            }
          `}</style>
          <div
            style={{
              maxWidth: 700,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            {/* Monthly orders slider */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Monthly catering orders</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{orders} orders</span>
              </div>
              <input
                className="roi-slider"
                type="range"
                min={1}
                max={50}
                value={orders}
                onChange={(e) => setOrders(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #E85618 0%, #E85618 ${((orders - 1) / 49) * 100}%, #E0D8CE ${((orders - 1) / 49) * 100}%, #E0D8CE 100%)`,
                }}
              />
            </div>

            {/* Average order size slider */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Average order size</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{fmt(avgSize)}</span>
              </div>
              <input
                className="roi-slider"
                type="range"
                min={100}
                max={2000}
                step={50}
                value={avgSize}
                onChange={(e) => setAvgSize(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #E85618 0%, #E85618 ${((avgSize - 100) / 1900) * 100}%, #E0D8CE ${((avgSize - 100) / 1900) * 100}%, #E0D8CE 100%)`,
                }}
              />
            </div>

            {/* Current marketplace fee slider */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Current marketplace fee</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{feePercent}%</span>
              </div>
              <input
                className="roi-slider"
                type="range"
                min={5}
                max={30}
                value={feePercent}
                onChange={(e) => setFeePercent(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #E85618 0%, #E85618 ${((feePercent - 5) / 25) * 100}%, #E0D8CE ${((feePercent - 5) / 25) * 100}%, #E0D8CE 100%)`,
                }}
              />
            </div>

            {/* Result */}
            <div
              style={{
                backgroundColor: '#EAFAF3',
                borderRadius: 16,
                padding: 32,
                marginTop: 8,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1D7A55', marginBottom: 4 }}>
                Estimated annual savings
              </p>
              <p style={{ fontSize: 48, fontWeight: 800, color: '#1D7A55' }}>
                {fmt(annualSavings)}
              </p>
              <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                vs. a {feePercent}% commission marketplace
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 24,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: C.muted }}>Marketplace loss</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FF6243' }}>{fmt(marketplaceLoss)}/mo</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: C.muted }}>TrayLoop (flat fee)</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>$49/mo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={section()}>
        <h2 style={{ ...h2, textAlign: 'center', marginBottom: 40 }}>
          Frequently asked questions
        </h2>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{
          backgroundColor: C.ink,
          textAlign: 'center',
        }}
      >
        <div style={{ ...section(), maxWidth: 700 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Ready to keep more of your catering revenue?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(254,252,250,0.7)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Join restaurants that have already switched to direct ordering and
            saved thousands every month.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton text="Get started →" href="/signup" />
            <PillButton text="Book a demo" href="/demo" variant="ghost" />
          </div>
        </div>
      </section>
    </>
  );
}

/* ── FAQ accordion item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 12,
        padding: '20px 24px',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{q}</p>
        <span
          style={{
            fontSize: 20,
            color: C.muted,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          +
        </span>
      </div>
      {open && (
        <p
          style={{
            fontSize: 15,
            color: C.muted,
            lineHeight: 1.7,
            marginTop: 12,
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}
