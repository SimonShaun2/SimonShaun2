import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrayLoop Admin',
  description: 'Platform administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', lineHeight: 1.5 }}>
        <nav style={{ background: '#7c3aed', color: 'white', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>TrayLoop Admin</span>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <a href="/" style={{ color: '#e9d5ff', textDecoration: 'none' }}>Dashboard</a>
            <a href="/organizations" style={{ color: '#e9d5ff', textDecoration: 'none' }}>Organizations</a>
            <a href="/users" style={{ color: '#e9d5ff', textDecoration: 'none' }}>Users</a>
          </div>
        </nav>
        <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
