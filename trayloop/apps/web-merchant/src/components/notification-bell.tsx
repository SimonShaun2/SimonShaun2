'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../lib/api';

interface Notification {
  id: string;
  type: string;
  subject: string;
  body: string;
  actionUrl: string | null;
  status: string;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await apiFetch('/api/notifications');
      setNotifications(res.data);
      setUnread(res.meta?.unread ?? 0);
    } catch {
      // Silent fail — notifications are non-critical
    }
  }

  async function handleMarkAllRead() {
    try {
      await apiFetch('/api/notifications/mark-all-read', { method: 'POST' });
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString(), status: 'read' })));
    } catch { /* non-critical */ }
  }

  async function handleClick(n: Notification) {
    // Mark as read
    if (!n.readAt) {
      try {
        await apiFetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' });
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, readAt: new Date().toISOString(), status: 'read' } : x));
        setUnread((prev) => Math.max(0, prev - 1));
      } catch { /* non-critical */ }
    }
    // Navigate
    if (n.actionUrl) {
      setOpen(false);
      window.location.href = n.actionUrl;
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    if (hrs < 48) return 'Yesterday';
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function truncateBody(body: string): string {
    const firstLine = body.split('\n')[0];
    if (firstLine.length <= 80) return firstLine;
    return firstLine.slice(0, 80) + '...';
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#D6D3D1', fontSize: 18, position: 'relative',
          padding: '4px 8px',
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 2,
            width: 16, height: 16, borderRadius: 8,
            background: '#DC2626', color: '#FFF',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          width: 360, maxHeight: 440,
          background: '#FFFFFF', border: '1px solid #E7E5E4',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #E7E5E4',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>
              Notifications
              {notifications.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', borderRadius: 10, padding: '1px 7px' }}>
                  {notifications.length}
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13, lineHeight: 1.6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 20, background: '#F0FDF4', color: '#22C55E', fontSize: 20, marginBottom: 8 }}>&#10003;</span>
                <br />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #F5F5F4',
                    cursor: n.actionUrl ? 'pointer' : 'default',
                    background: n.readAt ? '#FFFFFF' : '#FAFAF9',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E7E5E4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.readAt ? '#FFFFFF' : '#FAFAF9'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {!n.readAt && (
                          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#3B82F6', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 13, fontWeight: n.readAt ? 400 : 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.subject}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#78716C', margin: '2px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {truncateBody(n.body)}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: '#A8A29E', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2, lineHeight: 1.5 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
