import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CheckoutForm from '../../components/checkout-form';
import { fetchStorefront } from '../../lib/api';
import type { StorefrontData } from '../../lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const fontStack = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await fetchStorefront(slug);
    return {
      title: `${data.merchant.name} - Place an Order`,
      description: data.merchant.description || `Order from ${data.merchant.name}`,
    };
  } catch {
    return { title: 'Storefront Not Found' };
  }
}

export default async function StorefrontPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? ({} as Record<string, string | string[] | undefined>);
  const requestedLocation = typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : undefined;

  let data: StorefrontData;
  try {
    data = await fetchStorefront(slug);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      notFound();
    }
    return <ErrorState message="Something went wrong loading this storefront." />;
  }

  const hasMenu = data.menu.some((menu) => menu.categories.length > 0 || menu.uncategorizedPackages.length > 0);

  if (!hasMenu) {
    return (
      <main style={{ fontFamily: fontStack, background: '#FAF9F7', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 24px' }}>
          <EmptyState message="This merchant hasn't published their menu yet." />
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: fontStack, background: '#FAF9F7', minHeight: '100vh' }}>
      <CheckoutForm data={data} initialLocationSlug={requestedLocation} />
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main
      style={{
        fontFamily: fontStack,
        background: '#FAF9F7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#78716C', fontSize: 14 }}>{message}</p>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px dashed #D6D3D1',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
        color: '#78716C',
        fontSize: 15,
      }}
    >
      <p>{message}</p>
    </div>
  );
}
