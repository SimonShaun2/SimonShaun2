import type { Metadata } from 'next';
import './globals.css';
import Nav from '../components/nav';
import Footer from '../components/footer';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AnalyticsProvider } from '@trayloop/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const SITE_URL = 'https://trayloophq.com';
const SITE_TITLE = 'TrayLoop — Direct Catering Orders for Restaurants | No Commissions';
const SITE_DESCRIPTION =
  'Take back your catering revenue. TrayLoop gives restaurants a branded online storefront for direct catering orders — no marketplace commissions, no middlemen.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'TrayLoop',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
    // opengraph-image.tsx in the app directory is auto-detected and
    // added to this list by Next.js, so we don't repeat the images here.
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@trayloophq',
    site: '@trayloophq',
  },
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
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
