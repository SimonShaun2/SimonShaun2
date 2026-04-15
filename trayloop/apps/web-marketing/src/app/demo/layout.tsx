import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Book a TrayLoop Demo - See Direct Catering Orders in Action',
    description: 'Book a free personalized demo of TrayLoop and see how restaurants grow catering revenue with a branded storefront, automated follow-up, and AI reorder tools.',
    alternates: {
          canonical: 'https://trayloophq.com/demo',
    },
    openGraph: {
          title: 'Book a TrayLoop Demo - See Direct Catering Orders in Action',
          description: 'Book a free personalized demo of TrayLoop and see how restaurants grow catering revenue with a branded storefront and AI reorder tools.',
          url: 'https://trayloophq.com/demo',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'Book a TrayLoop Demo - See Direct Catering Orders in Action',
          description: 'Book a free personalized demo and see how restaurants grow catering revenue with zero commissions.',
    },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
