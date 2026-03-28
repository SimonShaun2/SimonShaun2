export default function NotFound() {
  return (
    <main style={{
      maxWidth: 480, margin: '0 auto', padding: '80px 24px',
      textAlign: 'center', fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ color: '#78716C', fontSize: 15, lineHeight: 1.6 }}>
        This restaurant page does not exist or is no longer accepting orders.
      </p>
    </main>
  );
}
