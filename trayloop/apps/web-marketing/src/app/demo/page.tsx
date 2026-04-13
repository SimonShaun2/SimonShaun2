'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const inputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: C.white,
  border: `1.5px solid ${C.creamDark}`,
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 14,
  color: C.ink,
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: 'vertical',
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: C.ink,
  marginBottom: 6,
  display: 'block',
};

const DEMO_EMAIL = 'hello@trayloophq.com';
const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? '';
const HUBSPOT_FORM_ID = process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID ?? '';

type DemoRequest = {
  name: string;
  email: string;
  restaurant: string;
  phone: string;
  notes: string;
};

function createMailtoHref(request: DemoRequest) {
  const subject = encodeURIComponent(
    `TrayLoop demo request${request.restaurant ? ` - ${request.restaurant}` : ''}`,
  );
  const body = encodeURIComponent(
    [
      'Hi TrayLoop team,',
      '',
      'I would like to book a demo.',
      '',
      `Name: ${request.name || 'Not provided'}`,
      `Email: ${request.email || 'Not provided'}`,
      `Restaurant: ${request.restaurant || 'Not provided'}`,
      `Phone: ${request.phone || 'Not provided'}`,
      '',
      'Notes:',
      request.notes || 'Not provided',
    ].join('\n'),
  );

  return `mailto:${DEMO_EMAIL}?subject=${subject}&body=${body}`;
}

export default function DemoPage() {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formCreatedRef = useRef(false);
  const hasHubSpotEmbed = Boolean(HUBSPOT_PORTAL_ID && HUBSPOT_FORM_ID);
  const [demoRequest, setDemoRequest] = useState<DemoRequest>({
    name: '',
    email: '',
    restaurant: '',
    phone: '',
    notes: '',
  });

  const mailtoHref = useMemo(
    () => createMailtoHref(demoRequest),
    [demoRequest],
  );

  const createForm = useCallback(() => {
    if (
      formCreatedRef.current
      || !formContainerRef.current
      || !HUBSPOT_PORTAL_ID
      || !HUBSPOT_FORM_ID
    ) return;
    if (typeof window === 'undefined' || !(window as any).hbspt) return;

    formCreatedRef.current = true;
    (window as any).hbspt.forms.create({
      portalId: HUBSPOT_PORTAL_ID,
      formId: HUBSPOT_FORM_ID,
      target: '#hubspot-demo-form',
      onFormReady: () => {
        trackEvent('marketing_demo_form_loaded', { placement: 'demo_page' });
      },
      onFormSubmitted: () => {
        trackEvent('marketing_demo_form_submitted', { placement: 'demo_page' });
      },
    });
  }, []);

  const handleFallbackSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('marketing_demo_form_submitted', {
      placement: 'demo_page',
      source: 'mailto_fallback',
    });
    window.location.href = mailtoHref;
  }, [mailtoHref]);

  useEffect(() => {
    trackEvent('marketing_demo_page_viewed', { placement: 'demo_page' });
    createForm();
  }, [createForm]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
      {hasHubSpotEmbed && (
        <Script
          src="https://js.hsforms.net/forms/v2.js"
          strategy="afterInteractive"
          onLoad={createForm}
        />
      )}

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
            A 20-minute walkthrough of your branded storefront, order management, and pricing, tailored to your restaurant.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'See your own branded catering page built live',
            'Walk through the order dashboard and customer tools',
            'Get transparent pricing with no surprises',
            'Learn how AI-assisted re-engagement brings past customers back',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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
            {hasHubSpotEmbed ? (
              <>
                <div id="hubspot-demo-form" ref={formContainerRef} />
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    textAlign: 'center',
                    padding: 24,
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
              </>
            ) : (
              <form
                onSubmit={handleFallbackSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: C.muted,
                    marginBottom: 4,
                  }}
                >
                  HubSpot is not connected in this environment, so the embedded demo request form is rendered directly on the page.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                  }}
                >
                  <div>
                    <label htmlFor="demo-name" style={labelStyle}>Your name</label>
                    <input
                      id="demo-name"
                      type="text"
                      value={demoRequest.name}
                      onChange={(event) => setDemoRequest((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Jane Doe"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-email" style={labelStyle}>Work email</label>
                    <input
                      id="demo-email"
                      type="email"
                      value={demoRequest.email}
                      onChange={(event) => setDemoRequest((current) => ({ ...current, email: event.target.value }))}
                      placeholder="jane@restaurant.com"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="demo-restaurant" style={labelStyle}>Restaurant name</label>
                  <input
                    id="demo-restaurant"
                    type="text"
                    value={demoRequest.restaurant}
                    onChange={(event) => setDemoRequest((current) => ({ ...current, restaurant: event.target.value }))}
                    placeholder="Chart's Mexican"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="demo-phone" style={labelStyle}>Phone</label>
                  <input
                    id="demo-phone"
                    type="tel"
                    value={demoRequest.phone}
                    onChange={(event) => setDemoRequest((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="(555) 555-5555"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="demo-notes" style={labelStyle}>What do you want help with?</label>
                  <textarea
                    id="demo-notes"
                    value={demoRequest.notes}
                    onChange={(event) => setDemoRequest((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Recurring orders, upsells, brand setup, or AI follow-up..."
                    style={textareaStyle}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: C.orange,
                    color: C.white,
                    border: 'none',
                    borderRadius: 999,
                    padding: '14px 22px',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 24px rgba(232, 86, 24, 0.2)',
                  }}
                >
                  Request my demo
                </button>

                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: C.muted,
                    textAlign: 'center',
                  }}
                >
                  This opens your email app with the demo request prefilled for the TrayLoop team.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
