import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop — Order Catering',
  description: 'Browse menus and order catering from local merchants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  );
}
