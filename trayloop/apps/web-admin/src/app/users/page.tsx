'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/users')
      .then((res) => setUsers(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#78716C', fontSize: 14 }}>Loading users...</p>;
  if (error) return <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>;

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: '#FEF3C7', text: '#92400E' },
    merchant: { bg: '#DBEAFE', text: '#1E40AF' },
    customer: { bg: '#F3F4F6', text: '#374151' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Users</h1>
          <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{users.length} total</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{
          padding: 40, border: '1px solid #E7E5E4', borderRadius: 10,
          background: '#FFFFFF', textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#78716C', margin: 0 }}>
            No users in the platform yet.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rc = roleColors[user.role] ?? roleColors.customer;
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: '14px 16px', color: '#78716C' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 9999,
                        fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.text,
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                        background: user.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: user.isActive ? '#166534' : '#991B1B',
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#78716C', fontSize: 12 }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
