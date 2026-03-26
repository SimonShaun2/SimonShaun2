import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop - Modern Commerce Platform',
  description: 'The all-in-one platform for modern merchants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
