'use client';

import NotificationBell from './notification-bell';

export default function NavBar() {
  return (
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
  );
}
