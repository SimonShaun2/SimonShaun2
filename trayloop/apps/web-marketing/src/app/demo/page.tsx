'use client';

import type { CSSProperties } from 'react';
import { trackEvent } from '@trayloop/analytics';


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
  marginTop: 7,
};

export default function DemoPage() {
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
          padding: '80px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: C.teal,
              marginBottom: 12,
            }}
          >
            Book a free demo
          </p>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.1,
              color: C.white,
              marginBottom: 16,
            }}
          >
            See TrayLoop
            <br />
            in action.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: 'rgba(254,252,250,0.7)',
              maxWidth: 420,
            }}
          >
            A 20-minute walkthrough of your branded storefront, order
            management, and pricing — tailored to your restaurant.
          </p>
        </div>

        {/* Bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'See your own branded catering page built live',
            'Walk through the order dashboard and customer tools',
            'Get transparent pricing with no surprises',
            'Learn how AI-assisted re-engagement brings past customers back',
          ].map((b) => (
            <div
              key={b}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
            >
              <span style={tealDot} />
              <span
                style={{
                  fontSize: 15,
                  color: 'rgba(254,252,250,0.85)',
                  lineHeight: 1.5,
                }}
              >
                {b}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 24,
            borderLeft: `3px solid ${C.teal}`,
            marginTop: 8,
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
            &ldquo;Our repeat catering rate doubled since we started using the
            AI re-engagement tools. Customers come back without us lifting a
            finger.&rdquo;
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>
            Marcus T. — Southside Catering
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: '1 1 400px',
          backgroundColor: C.cream,
          padding: '80px 48px',
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
              marginBottom: 32,
            }}
          >
            Let&apos;s get you set up.
          </h2>

          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            onSubmit={(e) => {
              e.preventDefault();
              trackEvent('marketing_demo_form_submitted', { placement: 'demo_page' });
            }}
          >
            {/* Name row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
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
              <label style={labelStyle}>
                What&apos;s your biggest challenge with catering today?
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                placeholder="Tell us what's on your mind..."
              />
            </div>

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
                marginTop: 4,
              }}
            >
              Book my free demo →
            </button>

            <p
              style={{
                fontSize: 12,
                color: C.muted,
                lineHeight: 1.6,
                textAlign: 'center',
              }}
            >
              No credit card required. We&apos;ll reach out within one business
              day to schedule your walkthrough.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
