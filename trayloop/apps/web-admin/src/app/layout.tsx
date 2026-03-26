import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop Admin',
  description: 'TrayLoop internal administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
