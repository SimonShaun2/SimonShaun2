import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up for TrayLoop - Start Your Commission-Free Catering Storefront',
    description: 'Get started with TrayLoop today. Launch your branded restaurant catering storefront in 48 hours. No commissions, no contracts, no setup fees. Just more revenue.',
    alternates: {
          canonical: 'https://trayloophq.com/signup',
    },
    openGraph: {
          title: 'Sign Up for TrayLoop - Start Your Commission-Free Catering Storefront',
          description: 'Launch your branded restaurant catering storefront in 48 hours. No commissions, no contracts. Just more revenue.',
          url: 'https://trayloophq.com/signup',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'Sign Up for TrayLoop - Start Your Commission-Free Catering Storefront',
          description: 'Launch your branded restaurant catering storefront in 48 hours. No commissions, no contracts.',
    },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
