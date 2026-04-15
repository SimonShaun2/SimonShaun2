import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TrayLoop Pricing - Flat-Rate Catering Software for Restaurants',
    description: 'Simple, transparent pricing for TrayLoop restaurant catering software. Flat $49/month plus 5% processing. No commissions. No hidden fees. Cancel anytime.',
    alternates: {
          canonical: 'https://trayloophq.com/pricing',
    },
    openGraph: {
          title: 'TrayLoop Pricing - Flat-Rate Catering Software for Restaurants',
          description: 'Simple, transparent pricing for TrayLoop restaurant catering software. Flat $49/month plus 5% processing. No commissions.',
          url: 'https://trayloophq.com/pricing',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'TrayLoop Pricing - Flat-Rate Catering Software for Restaurants',
          description: 'Simple, transparent pricing. Flat $49/month plus 5% processing. No commissions. No hidden fees.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
