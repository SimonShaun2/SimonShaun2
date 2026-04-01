'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Org {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/organizations')
      .then((res) => setOrgs(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#78716C', fontSize: 14 }}>Loading restaurants...</p>;
  if (error) return <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Restaurants</h1>
          <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{orgs.length} total</p>
        </div>
      </div>

      {orgs.length === 0 ? (
        <div style={{
          padding: 40, border: '1px solid #E7E5E4', borderRadius: 10,
          background: '#FFFFFF', textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#78716C', margin: 0 }}>
            No restaurants onboarded yet. They will appear here once merchants sign up.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Restaurant</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Slug / URL</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#78716C', flexShrink: 0,
                      }}>
                        {org.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{org.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#D4A853', fontFamily: 'monospace', fontSize: 12 }}>{org.slug}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                      background: org.isActive ? '#DCFCE7' : '#FEE2E2',
                      color: org.isActive ? '#166534' : '#991B1B',
                    }}>
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#78716C', fontSize: 12 }}>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
