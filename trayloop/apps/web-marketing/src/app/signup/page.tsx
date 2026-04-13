'use client';

import type { CSSProperties } from 'react';

/* ── Palette ── */
const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

/* ── Form field styles ── */
const inputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: C.white,
  border: `1.5px solid ${C.creamDark}`,
  borderRadius: 10,
  padding: 14,
  fontSize: 14,
  color: C.ink,
  outline: 'none',
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: C.ink,
  marginBottom: 6,
  display: 'block',
};

const tealDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: C.teal,
  flexShrink: 0,
  marginTop: 6,
};

/* ── Left panel features ── */
const dayOneFeatures = [
  {
    title: 'Branded catering storefront',
    desc: 'Your own custom page with your logo, colors, and menu — live within 48 hours.',
  },
  {
    title: 'Order management dashboard',
    desc: 'Accept, track, and manage every catering order from one clean interface.',
  },
  {
    title: 'Built-in payment processing',
    desc: 'Secure credit card payments powered by Stripe, included in your 5% processing fee.',
  },
  {
    title: 'AI-powered re-engagement',
    desc: 'Automatically bring past customers back with smart, personalized outreach.',
  },
  {
    title: 'White glove setup',
    desc: 'We build your storefront, configure your menu, and handle every technical detail.',
  },
];

export default function SignupPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: '100vh',
      }}
    >
      {/* ── Left panel ── */}
      <div
        style={{
          flex: '1 1 400px',
          backgroundColor: C.ink,
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Price anchor */}
          <div
            style={{
              backgroundColor: 'rgba(66,217,160,0.1)',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'inline-flex',
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>
              $29/month + 5%
            </span>
          </div>

          {/* Features */}
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.teal,
                marginBottom: 20,
              }}
            >
              What you get on day one
            </p>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
            >
              {dayOneFeatures.map((f) => (
                <div
                  key={f.title}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={tealDot} />
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: C.white,
                        marginBottom: 2,
                      }}
                    >
                      {f.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'rgba(254,252,250,0.6)',
                        lineHeight: 1.5,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 24,
              borderLeft: `3px solid ${C.teal}`,
            }}
          >
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: 'rgba(254,252,250,0.85)',
                fontStyle: 'italic',
                marginBottom: 10,
              }}
            >
              &ldquo;We were giving away 25% of every catering order. TrayLoop
              paid for itself the first week.&rdquo;
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>
              Maria S. — Bella Cucina
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              borderTop: '1px solid rgba(254,252,250,0.1)',
              paddingTop: 24,
              marginBottom: 20,
              justifyContent: 'center',
            }}
          >
            {[
              { value: '$2.4M+', label: 'Catering revenue processed' },
              { value: '100%', label: 'Done-for-you setup' },
              { value: '0%', label: 'Commissions' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', flex: '1 1 120px' }}>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.white,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(254,252,250,0.5)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 12,
              color: 'rgba(254,252,250,0.3)',
              textAlign: 'center',
            }}
          >
            &copy; {new Date().getFullYear()} TrayLoop. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: '1 1 400px',
          backgroundColor: C.cream,
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: C.ink,
              marginBottom: 8,
            }}
          >
            Create your account
          </h2>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 28,
              flexWrap: 'wrap',
            }}
          >
            {['Secure', 'We do the setup', 'No contracts'].map((badge) => (
              <span
                key={badge}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.muted,
                  backgroundColor: C.creamDark,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Name row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ flex: '1 1 180px' }}>
                <label style={labelStyle}>First name</label>
                <input type="text" style={inputStyle} placeholder="Jane" />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={labelStyle}>Last name</label>
                <input type="text" style={inputStyle} placeholder="Doe" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Restaurant name</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Bella Cucina"
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="jane@bellacucina.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                style={inputStyle}
                placeholder="(555) 555-5555"
              />
            </div>

            {/* City / State row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>City</label>
                <input type="text" style={inputStyle} placeholder="Chicago" />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>State</label>
                <input type="text" style={inputStyle} placeholder="IL" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Monthly catering revenue</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-15k">$5,000 – $15,000</option>
                <option value="15k-30k">$15,000 – $30,000</option>
                <option value="30k-50k">$30,000 – $50,000</option>
                <option value="50k+">$50,000+</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                style={inputStyle}
                placeholder="Create a password"
              />
              <p
                style={{
                  fontSize: 12,
                  color: C.muted,
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                At least 8 characters with a number or symbol.
              </p>
            </div>

            <p
              style={{
                fontSize: 12,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              By creating an account you agree to TrayLoop&apos;s{' '}
              <span
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Terms of Service
              </span>{' '}
              and{' '}
              <span
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Privacy Policy
              </span>
              .
            </p>

            <button
              type="submit"
              style={{
                backgroundColor: C.orange,
                color: C.white,
                border: 'none',
                borderRadius: 999,
                padding: '14px 28px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Get started →
            </button>

            <p
              style={{
                fontSize: 12,
                color: C.muted,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Secure signup · Payments by Stripe · Cancel anytime
            </p>

            <p
              style={{
                fontSize: 13,
                color: C.muted,
                textAlign: 'center',
              }}
            >
              Already have an account?{' '}
              <a
                href="https://dashboard.trayloophq.com/login"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: C.orange,
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                Sign in &rarr;
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
