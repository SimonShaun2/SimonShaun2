'use client';

import { useEffect } from 'react';

export default function CatalogPage() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; }
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Menu</h1>
      <div style={{
        border: '1px dashed #D6D3D1',
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
        maxWidth: 500,
      }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🍽️</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>Coming Soon</p>
        <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.5 }}>
          Menu management is being built. Your catalog, packages, and add-ons are already live on your storefront via the API.
        </p>
      </div>
    </div>
  );
}
