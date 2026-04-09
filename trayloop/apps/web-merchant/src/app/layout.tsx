import type { Metadata } from 'next';
import NavBar from '../components/nav-bar';
import { showStagingBanner } from '../lib/features';
import { AnalyticsProvider } from '@trayloop/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Bricolage_Grotesque, Fraunces, Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-display-bricolage',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrayLoop Merchant',
  description: 'Manage your catering business',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${fraunces.variable}`}>
      <body style={{
        margin: 0,
        fontFamily: 'var(--font-body), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1C1917',
        lineHeight: 1.5,
        backgroundColor: '#FAFAF9',
        ['--font-display' as string]: 'var(--font-display-bricolage)',
        ['--brand' as string]: '#E85618',
        ['--brand-bg' as string]: '#FEF2E8',
        ['--ink' as string]: '#1A1612',
        ['--cream' as string]: '#F9F5EF',
        ['--cream-dark' as string]: '#F0EBE1',
        ['--border' as string]: '#E7E5E4',
        ['--muted' as string]: '#78716C',
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
