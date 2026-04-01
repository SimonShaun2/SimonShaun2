import type { Metadata } from 'next';
import AdminShell from '../components/admin-shell';

export const metadata: Metadata = {
  title: 'TrayLoop Admin',
  description: 'Platform administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1C1917',
        lineHeight: 1.5,
        backgroundColor: '#FAF9F7',
      }}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
