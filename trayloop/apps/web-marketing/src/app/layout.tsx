import type { Metadata } from 'next';
import './globals.css';
import Nav from '../components/nav';
import Footer from '../components/footer';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AnalyticsProvider } from '@trayloop/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'TrayLoop — Direct Catering Orders for Restaurants | No Commissions',
  description:
    'Take back your catering revenue. TrayLoop gives restaurants a branded online storefront for direct catering orders — no marketplace commissions, no middlemen.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <AnalyticsProvider appName="marketing" />
        <Analytics />
        <SpeedInsights />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
