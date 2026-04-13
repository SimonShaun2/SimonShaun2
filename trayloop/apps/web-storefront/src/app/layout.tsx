import type { Metadata } from 'next';
import { showStagingBanner } from '../lib/features';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AnalyticsProvider } from '@trayloop/analytics';
import { Bricolage_Grotesque, Fraunces, Inter } from 'next/font/google';
import { StorefrontAnalytics, StorefrontSpeedInsights } from '../components/observability';

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
  title: 'Order Online',
  description: 'Browse the menu and place your order',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${fraunces.variable}`}>
      <body style={{
        margin: 0,
        fontFamily: 'var(--font-body), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1C1917',
        lineHeight: 1.5,
        backgroundColor: '#FAF9F7',
        ['--font-display' as string]: 'var(--font-display-bricolage)',
        ['--brand' as string]: '#E85618',
        ['--brand-bg' as string]: '#FEF2E8',
        ['--ink' as string]: '#1A1612',
        ['--cream' as string]: '#F9F5EF',
        ['--cream-dark' as string]: '#F0EBE1',
        ['--border' as string]: '#E7E5E4',
        ['--muted' as string]: '#78716C',
      }}>
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
        {children}
        <AnalyticsProvider appName="storefront" />
        <StorefrontAnalytics />
        <StorefrontSpeedInsights />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
