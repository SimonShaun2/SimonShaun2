'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { trackEvent } from '@trayloop/analytics';

const C = {
  cream: '#F9F5EF',
  ink: '#1A1612',
  orange: '#E85618',
  orangeSoft: '#FFF0E9',
  muted: '#7B6F65',
  white: '#FEFCFA',
  line: '#E8DDD1',
};

const DEMO_EMAIL = 'hello@trayloophq.com';

export default function DemoPage() {
  useEffect(() => {
    trackEvent('marketing_demo_page_viewed', { placement: 'demo_page' });
  }, []);

  return (
    <main style={{ backgroundColor: C.cream, minHeight: '100vh', padding: '72px 24px 96px' }}>
      <style>{`
        .tl-demo-shell {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 48px;
          align-items: start;
        }
        .tl-demo-proof {
          display: grid;
          gap: 16px;
          margin-top: 28px;
        }
        .tl-demo-card {
          background: ${C.white};
          border: 1px solid ${C.line};
          border-radius: 28px;
          padding: 38px;
          box-shadow: 0 22px 60px rgba(26, 22, 18, 0.06);
        }
        .tl-demo-form-wrap :global(iframe),
        .tl-demo-form-wrap iframe {
          width: 100% !important;
        }
        .tl-demo-form-wrap {
          min-height: 540px;
        }
        @media (max-width: 920px) {
          .tl-demo-shell {
            grid-template-columns: 1fr !important;
            max-width: 620px !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 768px) {
          .tl-demo-page {
            padding: 56px 18px 72px !important;
          }
          .tl-demo-title {
            font-size: 44px !important;
            line-height: 1.02 !important;
          }
          .tl-demo-copy {
            font-size: 17px !important;
            line-height: 1.65 !important;
          }
          .tl-demo-card {
            padding: 24px !important;
            border-radius: 22px !important;
          }
        }
      `}</style>

      <Script src="https://js-na2.hsforms.net/forms/embed/245856247.js" strategy="afterInteractive" />

      <div className="tl-demo-page tl-demo-shell">
        <section style={{ paddingTop: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              backgroundColor: C.orangeSoft,
              color: C.orange,
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 20,
            }}
          >
            Free 30-min demo
          </div>

          <h1
            className="tl-demo-title"
            style={{
              fontSize: 66,
              lineHeight: 0.96,
              letterSpacing: '-0.05em',
              color: C.ink,
              fontWeight: 800,
              maxWidth: 620,
              marginBottom: 18,
            }}
          >
            See how Tray.Loop stops the commission bleed.
          </h1>

          <p
            className="tl-demo-copy"
            style={{
              maxWidth: 580,
              fontSize: 18,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            Book a quick call and we&apos;ll show you exactly how restaurants use TrayLoop to own their
            catering orders, without marketplace middlemen or commission drag.
          </p>

          <div className="tl-demo-proof">
            {[
              'Branded ordering page live within a week',
              'Zero per-order commissions, ever',
              'Automated reorder outreach built in',
              'No long-term contracts required',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    backgroundColor: C.orangeSoft,
                    color: C.orange,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {'\u2713'}
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="tl-demo-card">
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 14 }}>Book a free Demo</div>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: C.muted, marginBottom: 24 }}>
            We&apos;re excited to meet with you. It takes less than two minutes to book.
          </p>

          <div className="tl-demo-form-wrap">
            <div
              className="hs-form-frame"
              data-region="na2"
              data-form-id="1ace2de1-fd67-4b27-9d0b-07d724abacfc"
              data-portal-id="245856247"
            />
          </div>

          <p
            style={{
              fontSize: 14,
              color: C.muted,
              textAlign: 'center',
              paddingTop: 22,
            }}
          >
            If the embedded form does not load,{' '}
            <a
              href={`mailto:${DEMO_EMAIL}`}
              style={{ color: C.orange, textDecoration: 'none', fontWeight: 700 }}
            >
              email us directly
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
