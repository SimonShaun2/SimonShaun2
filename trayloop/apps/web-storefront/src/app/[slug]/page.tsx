import { notFound } from 'next/navigation';
import { fetchStorefront } from '../../lib/api';
import type { StorefrontData } from '../../lib/api';
import type { Metadata } from 'next';
import CheckoutForm from '../../components/checkout-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await fetchStorefront(slug);
    return {
      title: `${data.merchant.name} — Place an Order`,
      description: data.merchant.description || `Order from ${data.merchant.name}`,
    };
  } catch {
    return { title: 'Storefront Not Found' };
  }
}

const fontStack = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;

  let data: StorefrontData;
  try {
    data = await fetchStorefront(slug);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      notFound();
    }
    return <ErrorState message="Something went wrong loading this storefront." />;
  }

  const { merchant, locations, menu } = data;

  if (menu.length === 0) {
    return (
      <main style={{ fontFamily: fontStack, background: '#FAF9F7', minHeight: '100vh' }}>
        <Header merchantName={merchant.name} merchantDescription={merchant.description} />
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 24px' }}>
          <EmptyState message="This merchant hasn't published their menu yet." />
        </div>
      </main>
    );
  }

  const primaryLocation = locations[0] ?? null;

  return (
    <main style={{ fontFamily: fontStack, background: '#FAF9F7', minHeight: '100vh' }}>
      <Header merchantName={merchant.name} merchantDescription={merchant.description} />

      {primaryLocation && <PolicyBadges location={primaryLocation} />}

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 24px 56px' }}>
        <CheckoutForm data={data} />
      </div>
    </main>
  );
}

function Header({ merchantName, merchantDescription }: { merchantName: string; merchantDescription?: string | null }) {
  return (
    <header style={{
      background: '#1C1917',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 1040,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}>
          {merchantName}
        </span>
        <span style={{
          color: '#D4A853',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}>
          {merchantDescription || 'Catering & Events'}
        </span>
      </div>
    </header>
  );
}

function PolicyBadges({ location }: { location: StorefrontData['locations'][0] }) {
  const badges: Array<{ label: string; value: string }> = [];

  if (location.minimumOrderAmount > 0) {
    badges.push({ label: 'Min Order', value: `$${(location.minimumOrderAmount / 100).toFixed(0)}` });
  }

  badges.push({ label: 'Lead Time', value: `${location.leadTimeHours}h advance` });

  if (location.depositRequired) {
    badges.push({ label: 'Deposit', value: 'Required' });
  }

  if (location.deliveryEnabled && location.deliveryRadiusMiles) {
    badges.push({ label: 'Delivery', value: `${location.deliveryRadiusMiles} mi radius` });
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E7E5E4',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1040,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        height: 48,
        overflowX: 'auto',
      }}>
        {badges.map((badge, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '1px',
              color: '#78716C',
            }}>
              {badge.label}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1C1917',
            }}>
              {badge.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main style={{
      fontFamily: fontStack,
      background: '#FAF9F7',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
        maxWidth: 420,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#78716C', fontSize: 14 }}>{message}</p>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px dashed #D6D3D1',
      borderRadius: 12,
      padding: 48,
      textAlign: 'center',
      color: '#78716C',
      fontSize: 15,
    }}>
      <p>{message}</p>
    </div>
  );
}
