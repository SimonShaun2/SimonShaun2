export default function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>TrayLoop Storefront</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Visit a merchant page to browse their catering menu and place an order.
      </p>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
        Try: <a href="/trayloop-catering" style={{ color: '#2563eb' }}>/trayloop-catering</a>
      </p>
    </main>
  );
}
