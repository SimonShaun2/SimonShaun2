'use client';

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
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

const tealDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: C.teal,
  flexShrink: 0,
  marginTop: 7,
};

// Replace with your Close scheduling link URL from app.close.com/settings/scheduler
const CLOSE_SCHEDULING_URL = process.env.NEXT_PUBLIC_CLOSE_SCHEDULING_URL
  || 'https://app.close.com/meeting/your-schedule-link/';

export default function DemoPage() {
  useEffect(() => {
    trackEvent('marketing_demo_page_viewed', { placement: 'demo_page' });
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
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
            <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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

      {/* ── Right panel: Close scheduling iframe ── */}
      <div
        style={{
          flex: '1 1 500px',
          backgroundColor: C.cream,
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 680 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.ink,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Pick a time that works for you
          </h2>
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            20-minute walkthrough · no prep needed
          </p>
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: 14,
              border: `1.5px solid ${C.creamDark}`,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <iframe
              src={CLOSE_SCHEDULING_URL}
              title="Book a demo with TrayLoop"
              width="100%"
              height="720"
              frameBorder="0"
              style={{ display: 'block', border: 'none' }}
              onLoad={() => trackEvent('marketing_demo_scheduler_loaded', { placement: 'demo_page' })}
            />
          </div>
          <p
            style={{
              fontSize: 12,
              color: C.muted,
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Trouble loading?{' '}
            <a
              href={CLOSE_SCHEDULING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.orange, textDecoration: 'none', fontWeight: 600 }}
            >
              Open scheduler in a new tab →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
