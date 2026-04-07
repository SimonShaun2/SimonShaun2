import type { Metadata } from 'next';
import NavBar from '../components/nav-bar';
import { showStagingBanner } from '../lib/features';
import { AnalyticsProvider } from '@trayloop/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'TrayLoop Merchant',
  description: 'Manage your catering business',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1C1917',
        lineHeight: 1.5,
        backgroundColor: '#FAFAF9',
      }}>
        <style>{`
          @media (max-width: 960px) {
            .merchant-shell {
              flex-direction: column;
            }

            .merchant-main {
              max-width: none !important;
              padding: 20px 16px 28px !important;
            }

            .merchant-main-inner {
              max-width: none !important;
            }
          }
        `}</style>
        {showStagingBanner ? (
          <div style={{
            background: '#1D4ED8',
            color: '#EFF6FF',
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            Staging Environment
          </div>
        ) : null}
        <div className="merchant-shell" style={{ display: 'flex', minHeight: '100vh' }}>
          <NavBar />
          <main className="merchant-main" style={{ flex: 1, minWidth: 0, padding: '28px 32px', maxWidth: 'calc(100vw - 236px)' }}>
            <div className="merchant-main-inner" style={{ maxWidth: 1180 }}>
              {children}
            </div>
          </main>
        </div>
        <AnalyticsProvider appName="merchant" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
