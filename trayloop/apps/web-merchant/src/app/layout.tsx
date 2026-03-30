import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const NotificationBell = dynamic(() => import('../components/notification-bell'), { ssr: false });

export const metadata: Metadata = {
  title: 'TrayLoop Merchant',
  description: 'Manage your catering business',
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
        backgroundColor: '#FAFAF9',
      }}>
        <nav style={{
          background: '#1C1917',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <a href="/" style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', textDecoration: 'none' }}>
            TrayLoop
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, fontWeight: 500 }}>
            <a href="/" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Orders</a>
            <a href="/follow-ups" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Follow-Ups</a>
            <a href="/customers" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Customers</a>
            <a href="/catalog" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Offerings</a>
            <a href="/settings" style={{ color: '#D6D3D1', textDecoration: 'none' }}>Setup</a>
            <NotificationBell />
          </div>
        </nav>
        <main style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
