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
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/login'; return; }

    apiFetch('/api/admin/organizations')
      .then((res) => setOrgs(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#6b7280' }}>Loading organizations...</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Organizations</h1>
      {orgs.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No organizations found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Slug</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{org.name}</td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>{org.slug}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                    background: org.isActive ? '#dcfce7' : '#fee2e2',
                    color: org.isActive ? '#166534' : '#991b1b',
                  }}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>{new Date(org.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
