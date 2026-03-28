'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Package {
  id: string; name: string; description: string | null;
  pricePerHead: number; currency: string; pricing: string;
  minHeadCount: number | null; maxHeadCount: number | null;
  isActive: boolean;
}

interface AddOn {
  id: string; name: string; description: string | null;
  price: number; currency: string; isActive: boolean;
}

interface Category {
  id: string; name: string; description: string | null;
  isActive: boolean; packages: Package[];
}

interface Catalog {
  id: string; name: string; description: string | null;
  isActive: boolean; categories: Category[];
  uncategorizedPackages: Package[];
  addOns: AddOn[];
}

export default function CatalogPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      const res = await apiFetch('/api/catalogs/menu');
      setCatalogs(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading menu...</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  if (catalogs.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Menu</h1>
        <div style={{ border: '1px dashed #D6D3D1', borderRadius: 12, padding: '48px 24px', textAlign: 'center', maxWidth: 500 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🍽️</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>No Catalogs Yet</p>
          <p style={{ fontSize: 14, color: '#78716C' }}>Create your first catalog to start building your menu.</p>
        </div>
      </div>
    );
  }

  const totalPackages = catalogs.reduce((s, c) => s + c.categories.reduce((s2, cat) => s2 + cat.packages.length, 0) + c.uncategorizedPackages.length, 0);
  const totalAddOns = catalogs.reduce((s, c) => s + c.addOns.length, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Menu</h1>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6b7280' }}>
          <span>{catalogs.length} catalog{catalogs.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{totalPackages} package{totalPackages !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{totalAddOns} add-on{totalAddOns !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {catalogs.map((catalog) => (
          <div key={catalog.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {/* Catalog header */}
            <div style={{ background: '#F9FAFB', padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{catalog.name}</h2>
                {catalog.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{catalog.description}</p>}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                background: catalog.isActive ? '#DCFCE7' : '#F3F4F6',
                color: catalog.isActive ? '#166534' : '#6B7280',
              }}>{catalog.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <div style={{ padding: 20 }}>
              {/* Categories + packages */}
              {catalog.categories.map((cat) => (
                <div key={cat.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1C1917' }}>{cat.name}</h3>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>({cat.packages.length})</span>
                  </div>

                  {cat.packages.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#9ca3af', paddingLeft: 12 }}>No packages in this category</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {cat.packages.map((pkg) => (
                        <PackageRow key={pkg.id} pkg={pkg} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Uncategorized packages */}
              {catalog.uncategorizedPackages.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', color: '#9ca3af' }}>Uncategorized</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {catalog.uncategorizedPackages.map((pkg) => (
                      <PackageRow key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {catalog.addOns.length > 0 && (
                <div>
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginTop: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', color: '#1C1917' }}>Add-Ons</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 6 }}>
                      {catalog.addOns.map((addOn) => (
                        <div key={addOn.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderRadius: 6, border: '1px solid #f3f4f6',
                          opacity: addOn.isActive ? 1 : 0.5,
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{addOn.name}</span>
                            {addOn.description && <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 6 }}>{addOn.description}</span>}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#D4A853' }}>${(addOn.price / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {catalog.categories.length === 0 && catalog.uncategorizedPackages.length === 0 && catalog.addOns.length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 16 }}>This catalog is empty</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageRow({ pkg }: { pkg: Package }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderRadius: 8, border: '1px solid #f3f4f6',
      opacity: pkg.isActive ? 1 : 0.5,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{pkg.name}</span>
          {!pkg.isActive && (
            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }}>Inactive</span>
          )}
        </div>
        {pkg.description && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{pkg.description}</p>}
        {(pkg.minHeadCount || pkg.maxHeadCount) && (
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {pkg.minHeadCount && `Min ${pkg.minHeadCount}`}
            {pkg.minHeadCount && pkg.maxHeadCount && ' · '}
            {pkg.maxHeadCount && `Max ${pkg.maxHeadCount}`}
            {' guests'}
          </span>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#D4A853' }}>${(pkg.pricePerHead / 100).toFixed(2)}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>/{pkg.pricing === 'per_head' ? 'person' : 'flat'}</div>
      </div>
    </div>
  );
}
