'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { trackEvent } from '@trayloop/analytics';

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

const DEMO_EMAIL = 'hello@trayloophq.com';
const HUBSPOT_PORTAL_ID = '245856247';
const HUBSPOT_FORM_ID = '1ace2de1-fd67-4b27-9d0b-07d724abacfc';
const HUBSPOT_REGION = 'na2';

declare global {
  interface Window {
    hbspt?: {
      forms?: {
        create: (options: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
        }) => void;
      };
    };
  }
}

export default function DemoPage() {
  const formReadyRef = useRef(false);

  useEffect(() => {
    trackEvent('marketing_demo_page_viewed', { placement: 'demo_page' });
  }, []);

  function mountHubspotForm() {
    if (formReadyRef.current) {
      return;
    }

    const formHost = document.getElementById('hubspot-demo-form');
    if (!formHost || !window.hbspt?.forms?.create) {
      return;
    }

    formHost.innerHTML = '';
    window.hbspt.forms.create({
      region: HUBSPOT_REGION,
      portalId: HUBSPOT_PORTAL_ID,
      formId: HUBSPOT_FORM_ID,
      target: '#hubspot-demo-form',
    });
    formReadyRef.current = true;
    trackEvent('marketing_demo_form_loaded', { placement: 'demo_page' });
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .tl-demo-left,
          .tl-demo-right {
            flex: 1 1 100% !important;
            padding: 56px 18px !important;
          }
          .tl-demo-left {
            gap: 24px !important;
          }
          .tl-demo-hero-title {
            font-size: 38px !important;
            line-height: 1.04 !important;
          }
          .tl-demo-hero-copy {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }
          .tl-demo-form-card {
            padding: 20px !important;
            min-height: auto !important;
          }
          .tl-demo-form-shell {
            max-width: 100% !important;
          }
          .tl-demo-left {
            text-align: center !important;
          }
          .tl-demo-bullets {
            align-items: stretch !important;
          }
          .tl-demo-bullet {
            justify-content: center !important;
            text-align: left !important;
          }
        }
      `}</style>
      <Script
        src="https://js-na2.hsforms.net/forms/embed/245856247.js"
        strategy="afterInteractive"
        onLoad={mountHubspotForm}
      />

      <div
        className="tl-demo-left"
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
            className="tl-demo-hero-title"
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
            className="tl-demo-hero-copy"
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: 'rgba(254,252,250,0.7)',
              maxWidth: 420,
            }}
          >
            A 20-minute walkthrough of your branded storefront, order management, and pricing, tailored to your restaurant.
          </p>
        </div>

        <div className="tl-demo-bullets" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'See your own branded catering page built live',
            'Walk through the order dashboard and customer tools',
            'Get transparent pricing with no surprises',
            'Learn how AI-assisted re-engagement brings past customers back',
          ].map((item) => (
            <div key={item} className="tl-demo-bullet" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={tealDot} />
              <span
                style={{
                  fontSize: 15,
                  color: 'rgba(254,252,250,0.85)',
                  lineHeight: 1.5,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

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
            Marcus T. - Southside Catering
          </p>
        </div>
      </div>

      <div
        className="tl-demo-right"
        style={{
          flex: '1 1 500px',
          backgroundColor: C.cream,
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="tl-demo-form-shell" style={{ width: '100%', maxWidth: 680 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.ink,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Request your free demo
          </h2>
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            20-minute walkthrough - no prep needed
          </p>

          <div
            className="tl-demo-form-card"
            style={{
              backgroundColor: C.white,
              borderRadius: 14,
              border: `1.5px solid ${C.creamDark}`,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              padding: 32,
              minHeight: 400,
            }}
          >
            <div id="hubspot-demo-form" />
            <p
              style={{
                fontSize: 14,
                color: C.muted,
                textAlign: 'center',
                padding: '18px 0 12px',
              }}
            >
              If the embedded form does not load,{' '}
              <a
                href={`mailto:${DEMO_EMAIL}`}
                style={{ color: C.orange, textDecoration: 'none', fontWeight: 600 }}
              >
                email us directly
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
