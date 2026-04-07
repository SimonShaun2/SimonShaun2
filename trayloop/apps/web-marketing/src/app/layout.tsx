import type { Metadata } from 'next';
import './globals.css';
import Nav from '../components/nav';
import Footer from '../components/footer';

export const metadata: Metadata = {
  title: 'TrayLoop — Direct Catering Orders for Restaurants | No Commissions',
  description:
    'Take back your catering revenue. TrayLoop gives restaurants a branded online storefront for direct catering orders — no marketplace commissions, no middlemen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
