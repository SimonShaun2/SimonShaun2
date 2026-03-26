import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop Merchant Dashboard',
  description: 'Manage your store on TrayLoop',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
