import type { Metadata } from 'next';
import NavBar from '../components/nav-bar';

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
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <NavBar />
          <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', maxWidth: 'calc(100vw - 236px)' }}>
            <div style={{ maxWidth: 1180 }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
