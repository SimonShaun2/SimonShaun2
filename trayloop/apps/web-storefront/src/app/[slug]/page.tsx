import { notFound } from 'next/navigation';
import { fetchStorefront } from '../../lib/api';
import type { StorefrontData, StorefrontLocation, StorefrontMenu, StorefrontPackage, StorefrontAddOn } from '../../lib/api';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await fetchStorefront(slug);
    return {
      title: `${data.merchant.name} — Order Catering`,
      description: data.merchant.description || `Order catering from ${data.merchant.name}`,
    };
  } catch {
    return { title: 'Storefront Not Found' };
  }
}

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
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <MerchantHeader merchant={merchant} />
        <EmptyState message="This merchant hasn't published their menu yet." />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <MerchantHeader merchant={merchant} />

      {locations.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Locations</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {locations.map((loc) => (
              <LocationCard key={loc.slug} location={loc} />
            ))}
          </div>
        </section>
      )}

      {menu.map((catalog, i) => (
        <MenuSection key={i} menu={catalog} />
      ))}
    </main>
  );
}

function MerchantHeader({ merchant }: { merchant: StorefrontData['merchant'] }) {
  return (
    <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{merchant.name}</h1>
      {merchant.description && (
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>{merchant.description}</p>
      )}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
        {merchant.phone && <span>{merchant.phone}</span>}
        {merchant.website && (
          <a href={merchant.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
            Website
          </a>
        )}
      </div>
    </header>
  );
}

function LocationCard({ location }: { location: StorefrontLocation }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{location.name}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        {location.address}, {location.city}, {location.state} {location.zipCode}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
        {location.deliveryEnabled && <Tag>Delivery</Tag>}
        {location.pickupEnabled && <Tag>Pickup</Tag>}
        {location.depositRequired && <Tag variant="info">Deposit Required</Tag>}
        <Tag variant="neutral">Lead time: {location.leadTimeHours}h</Tag>
        {location.minimumOrderAmount > 0 && (
          <Tag variant="neutral">Min: ${(location.minimumOrderAmount / 100).toFixed(2)}</Tag>
        )}
      </div>
    </div>
  );
}

function MenuSection({ menu }: { menu: StorefrontMenu }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{menu.name}</h2>
      {menu.description && <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{menu.description}</p>}

      {menu.categories.map((category) => (
        <div key={category.id} style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>{category.name}</h3>
          {category.description && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{category.description}</p>}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {category.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      ))}

      {menu.uncategorizedPackages.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {menu.uncategorizedPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

      {menu.addOns.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Add-Ons</h3>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {menu.addOns.map((addOn) => (
              <AddOnCard key={addOn.id} addOn={addOn} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PackageCard({ pkg }: { pkg: StorefrontPackage }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h4 style={{ fontWeight: 600, fontSize: '1.05rem' }}>{pkg.name}</h4>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
          ${(pkg.pricePerHead / 100).toFixed(2)}/person
        </span>
      </div>
      {pkg.description && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{pkg.description}</p>}
      {(pkg.minimumHeadcount || pkg.maximumHeadcount) && (
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
          {pkg.minimumHeadcount && `Min ${pkg.minimumHeadcount}`}
          {pkg.minimumHeadcount && pkg.maximumHeadcount && ' · '}
          {pkg.maximumHeadcount && `Max ${pkg.maximumHeadcount}`}
          {' guests'}
        </p>
      )}
      {pkg.includes.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Includes:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pkg.includes.map((item, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: '#6b7280', padding: '0.1rem 0' }}>
                {item.isOptional ? '○' : '•'} {item.name}
                {item.isOptional && <span style={{ color: '#9ca3af' }}> (optional)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AddOnCard({ addOn }: { addOn: StorefrontAddOn }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontWeight: 600 }}>{addOn.name}</p>
        {addOn.description && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{addOn.description}</p>}
      </div>
      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>${(addOn.price / 100).toFixed(2)}</span>
    </div>
  );
}

function Tag({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'info' | 'neutral' }) {
  const colors = {
    default: { bg: '#dcfce7', color: '#166534' },
    info: { bg: '#dbeafe', color: '#1e40af' },
    neutral: { bg: '#f3f4f6', color: '#374151' },
  };
  const style = colors[variant];
  return (
    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: style.bg, color: style.color, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Oops</h1>
      <p style={{ color: '#6b7280' }}>{message}</p>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
      <p>{message}</p>
    </div>
  );
}
