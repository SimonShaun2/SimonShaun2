'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { trackEvent } from '@trayloop/analytics';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  muted: '#7B6F65',
  white: '#FEFCFA',
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
    <main style={{ backgroundColor: C.cream, minHeight: '100vh', padding: '72px 24px 96px' }}>
      <style>{`
        .tl-demo-shell {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .tl-demo-card {
          background: ${C.white};
          border: 1px solid ${C.creamDark};
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 22px 60px rgba(26, 22, 18, 0.06);
        }
        @media (max-width: 768px) {
          .tl-demo-page {
            padding: 56px 18px 72px !important;
          }
          .tl-demo-shell {
            max-width: 560px !important;
          }
          .tl-demo-title {
            font-size: 40px !important;
            line-height: 1.04 !important;
          }
          .tl-demo-copy {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }
          .tl-demo-card {
            padding: 22px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      <Script
        src="https://js-na2.hsforms.net/forms/embed/245856247.js"
        strategy="afterInteractive"
        onLoad={mountHubspotForm}
      />

      <div className="tl-demo-page tl-demo-shell">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 999,
            backgroundColor: '#FFF0E9',
            color: C.orange,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 20,
          }}
        >
          Book a demo
        </div>

        <h1
          className="tl-demo-title"
          style={{
            fontSize: 58,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            color: C.ink,
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          Request your free demo.
        </h1>

        <p
          className="tl-demo-copy"
          style={{
            maxWidth: 620,
            margin: '0 auto 30px',
            fontSize: 18,
            lineHeight: 1.7,
            color: C.muted,
          }}
        >
          Walk through the storefront, operator workflow, pricing tiers, and repeat-revenue system in one focused session.
        </p>

        <div className="tl-demo-card">
          <div id="hubspot-demo-form" />
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              textAlign: 'center',
              paddingTop: 24,
            }}
          >
            If the form does not appear,{' '}
            <a
              href={`mailto:${DEMO_EMAIL}`}
              style={{ color: C.orange, textDecoration: 'none', fontWeight: 700 }}
            >
              email us directly
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
