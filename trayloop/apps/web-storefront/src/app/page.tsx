export default function HomePage() {
  return (
    <main style={{
      maxWidth: 480, margin: '0 auto', padding: '80px 24px',
      textAlign: 'center', fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
        Welcome
      </h1>
      <p style={{ color: '#78716C', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
        Visit a restaurant page to browse their menu and place an order.
      </p>
      <a
        href="/trayloop-catering"
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          background: '#1C1917',
          color: '#FFFFFF',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        View Demo Storefront
      </a>
    </main>
  );
}
