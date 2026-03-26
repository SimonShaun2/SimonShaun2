import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop Merchant Dashboard',
  description: 'Manage your catering business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', lineHeight: 1.5 }}>
        <nav style={{ background: '#111827', color: 'white', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>TrayLoop Merchant</span>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <a href="/" style={{ color: '#d1d5db', textDecoration: 'none' }}>Orders</a>
            <a href="/customers" style={{ color: '#d1d5db', textDecoration: 'none' }}>Customers</a>
            <a href="/catalog" style={{ color: '#d1d5db', textDecoration: 'none' }}>Menu</a>
            <a href="/settings" style={{ color: '#d1d5db', textDecoration: 'none' }}>Settings</a>
          </div>
        </nav>
        <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
