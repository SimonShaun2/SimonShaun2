import type { Metadata } from 'next';
import Script from 'next/script';
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

// Meta Pixel ID is public (visible in page source) so hardcoding is safe.
// Env var override still works for staging/test pixels.
const DEFAULT_FB_PIXEL_ID = '1744035356719506';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? DEFAULT_FB_PIXEL_ID;

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
        {fbPixelId ? (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${fbPixelId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
