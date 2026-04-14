import type { Metadata } from 'next';
import HowItWorksContent from './HowItWorksContent';

export const metadata: Metadata = {
    title: 'How TrayLoop Works — Direct Catering Orders, No Commissions',
    description: 'See how TrayLoop turns scattered catering orders into a predictable revenue stream. Branded storefront, automated follow-up, AI reorder triggers — zero commissions.',
    alternates: {
          canonical: 'https://trayloophq.com/how-it-works',
    },
    openGraph: {
          title: 'How TrayLoop Works — Direct Catering Orders, No Commissions',
          description: 'See how TrayLoop turns scattered catering orders into a predictable revenue stream with automated follow-up and AI reorder triggers.',
          url: 'https://trayloophq.com/how-it-works',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'How TrayLoop Works — Direct Catering Orders, No Commissions',
          description: 'See how TrayLoop turns scattered catering orders into a predictable revenue stream with automated follow-up and AI reorder triggers.',
    },
};

export default function HowItWorksPage() {
    return <HowItWorksContent />;
}
