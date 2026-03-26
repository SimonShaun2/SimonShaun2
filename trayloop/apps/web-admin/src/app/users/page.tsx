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
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/login'; return; }

    apiFetch('/api/admin/users')
      .then((res) => setUsers(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#6b7280' }}>Loading users...</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Users</h1>
      {users.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No users found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>{user.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: '#f3f4f6', color: '#374151' }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                    background: user.isActive ? '#dcfce7' : '#fee2e2',
                    color: user.isActive ? '#166534' : '#991b1b',
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
