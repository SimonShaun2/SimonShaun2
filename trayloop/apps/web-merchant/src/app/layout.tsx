import type { Metadata } from 'next';
import NavBar from '../components/nav-bar';
import { MerchantAnalytics, MerchantSpeedInsights } from '../components/observability';
import { PlanAccessProvider } from '../components/plan-access-provider';
import { showStagingBanner } from '../lib/features';
import { AnalyticsProvider } from '@trayloop/analytics';
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
          .tl-grid-auto {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            width: 100%;
          }
          .tl-grid-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            width: 100%;
          }
          .tl-grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
          }
          .tl-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
          }
          .tl-grid-4 {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
          }
          .tl-row-scroll {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scrollbar-width: thin;
            padding-bottom: 4px;
          }
          .tl-row-scroll > * {
            flex: 0 0 auto;
          }
          .tl-split-main {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(300px, 380px);
            gap: 20px;
            align-items: start;
            width: 100%;
          }
          @media (max-width: 1023px) {
            .tl-split-main {
              grid-template-columns: 1fr;
            }
          }
          .tl-dash-3col {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.95fr);
            gap: 20px;
            width: 100%;
            align-items: start;
          }
          @media (max-width: 1279px) {
            .tl-dash-3col {
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            }
            .tl-dash-3col > :nth-child(3) {
              grid-column: 1 / -1;
            }
          }
          @media (max-width: 767px) {
            .tl-dash-3col {
              grid-template-columns: 1fr;
            }
            .tl-dash-3col > :nth-child(3) {
              grid-column: auto;
            }
          }
          @media (max-width: 1023px) {
            .tl-grid-4 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .tl-grid-3 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 767px) {
            .tl-grid-2,
            .tl-grid-3,
            .tl-grid-4 {
              grid-template-columns: 1fr;
            }
          }
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
        <PlanAccessProvider>
          <div className="merchant-shell" style={{ display: 'flex', minHeight: '100vh' }}>
            <NavBar />
            <main className="merchant-main" style={{ flex: 1, minWidth: 0, padding: '28px 32px', width: '100%' }}>
              <div className="merchant-main-inner" style={{ width: '100%', maxWidth: '100%' }}>
                {children}
              </div>
            </main>
          </div>
        </PlanAccessProvider>
        <AnalyticsProvider appName="merchant" />
        <MerchantAnalytics />
        <MerchantSpeedInsights />
      </body>
    </html>
  );
}
