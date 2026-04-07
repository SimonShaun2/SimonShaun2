import type { Metadata } from 'next';
import { showStagingBanner } from '../lib/features';

export const metadata: Metadata = {
  title: 'Order Online',
  description: 'Browse the menu and place your order',
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
        {showStagingBanner ? (
          <div style={{
            background: '#1D4ED8',
            color: '#EFF6FF',
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            Staging Environment
          </div>
        ) : null}
        {children}
      </body>
    </html>
  );
}
