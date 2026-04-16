'use client';

import { useEffect, useMemo, useState } from 'react';
import AutomationEnginePanel, { type SummaryMetric } from '../../components/automation-engine-panel';
import {
  fetchMerchantCustomers,
  fetchMerchantFollowUps,
  updateMerchantFollowUp,
  type MerchantCustomerSummary,
  type MerchantFollowUpSummary,
} from '../../lib/api';
import { hasMerchantSession } from '../../lib/session';

type QueueFilter = 'all' | 'pending' | 'overdue' | 'completed';

const FILTERS: Array<{ value: QueueFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Done' },
];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatShortDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function daysSince(dateString: string | null) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
}

function dueTone(days: number, status: string) {
  if (status === 'completed') return 'Done';
  if (days < 0) return 'Overdue';
  if (days <= 3) return 'Due soon';
  return 'Pending';
}

function buildReminderCopy(item: MerchantFollowUpSummary) {
  const firstName = item.customer.name.split(' ')[0] ?? item.customer.name;
  return `Hi ${firstName}, following up on your ${formatShortDate(item.order.eventDate)} order. We’d love to keep your next catering event moving.`;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<MerchantFollowUpSummary[]>([]);
  const [customers, setCustomers] = useState<MerchantCustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [paginationTotal, setPaginationTotal] = useState(0);

  useEffect(() => {
    if (!hasMerchantSession()) {
      window.location.href = '/login';
      return;
    }

    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [followUpResult, customerRows] = await Promise.all([
        fetchMerchantFollowUps({ pageSize: 100 }),
        fetchMerchantCustomers(),
      ]);
      setFollowUps(followUpResult.data);
      setPaginationTotal(followUpResult.meta.total);
      setCustomers(customerRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(item: MerchantFollowUpSummary) {
    setSavingId(item.id);
    setError('');
    try {
      await updateMerchantFollowUp(item.id, {
        status: item.status === 'completed' ? 'pending' : 'completed',
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSavingId(null);
    }
  }

  const derived = useMemo(() => {
    const now = Date.now();
    const withAge = followUps.map((item) => ({
      ...item,
      dueDays: Math.floor((new Date(item.dueDate).getTime() - now) / 86_400_000),
    }));

    const pending = withAge.filter((item) => item.status === 'pending');
    const completed = withAge.filter((item) => item.status === 'completed');
    const overdue = pending.filter((item) => item.dueDays < 0);
    const dueSoon = pending.filter((item) => item.dueDays >= 0 && item.dueDays <= 3);
    const pendingValue = pending.reduce((sum, item) => sum + item.order.total, 0);
    const repeatCustomers = customers.filter((customer) => customer.orderCount > 1);
    const dormantCustomers = customers.filter((customer) => daysSince(customer.lastOrderDate) >= 90);
    const reorderReady = customers.filter((customer) => {
      const age = daysSince(customer.lastOrderDate);
      return customer.orderCount > 1 && age >= 21 && age <= 60;
    });
    const vipAtRisk = customers.filter((customer) => customer.totalSpend >= 100_000 && daysSince(customer.lastOrderDate) >= 45);

    return {
      rows: withAge,
      pending,
      completed,
      overdue,
      dueSoon,
      pendingValue,
      repeatCustomers,
      dormantCustomers,
      reorderReady,
      vipAtRisk,
    };
  }, [customers, followUps]);

  const visibleRows = useMemo(() => {
    const rows =
      filter === 'all'
        ? derived.rows
        : filter === 'overdue'
          ? derived.overdue
          : derived.rows.filter((item) => item.status === filter);

    return [...rows].sort((a, b) => {
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;
      if (a.dueDays !== b.dueDays) return a.dueDays - b.dueDays;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [derived.rows, derived.overdue, filter]);

  const summaryMetrics: SummaryMetric[] = [
    {
      label: 'Pending',
      value: String(derived.pending.length),
      note: 'Work waiting in the queue',
      tone: 'warning',
    },
    {
      label: 'Overdue',
      value: String(derived.overdue.length),
      note: 'Needs immediate attention',
      tone: 'accent',
    },
    {
      label: 'Dormant',
      value: String(derived.dormantCustomers.length),
      note: 'Customers quiet for 90+ days',
      tone: 'neutral',
    },
    {
      label: 'At-risk value',
      value: formatCurrency(derived.pendingValue),
      note: 'Open follow-ups tied to revenue',
      tone: 'good',
    },
  ];

  const radar = [
    {
      title: 'Reorder-ready customers',
      count: derived.reorderReady.length,
      note: 'Repeat customers 21-60 days out',
      tone: 'good' as const,
    },
    {
      title: 'Dormant customers',
      count: derived.dormantCustomers.length,
      note: 'Win-back candidates by cadence',
      tone: 'warning' as const,
    },
    {
      title: 'VIP at risk',
      count: derived.vipAtRisk.length,
      note: 'High-spend accounts drifting away',
      tone: 'accent' as const,
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <AutomationEnginePanel
        eyebrow="Retention queue"
        title="Follow-ups that keep accounts warm"
        description="Track post-order outreach, spot overdue nudges, and keep high-value customers from going dark. Everything here is built for fast scanning and quick action."
        metrics={summaryMetrics}
        primaryAction={{ label: 'Open automations', href: '/automations' }}
        secondaryAction={{ label: 'Review customers', href: '/customers' }}
        status={{
          label: 'Queue live',
          note: 'Pending follow-ups, overdue nudges, and dormant accounts are all visible in one place.',
          tone: 'good',
        }}
      />

      {error ? (
        <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', borderRadius: 16, padding: '14px 16px', fontSize: 14 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        <section
          style={{
            border: '1px solid #E7E5E4',
            borderRadius: 28,
            background: '#FFFFFF',
            overflow: 'hidden',
            boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
          }}
        >
          <div style={{ padding: 24, borderBottom: '1px solid #F5F5F4' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', fontWeight: 800 }}>
                  Outreach queue
                </div>
                <h2 style={{ margin: '8px 0 0', fontSize: 24, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                  Follow-up worklist
                </h2>
              </div>
              <div style={{ fontSize: 13, color: '#78716C' }}>
                {paginationTotal} total
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
              {FILTERS.map((option) => {
                const active = filter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    style={{
                      border: active ? 'none' : '1px solid #E7E5E4',
                      background: active ? '#1C1917' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#57534E',
                      borderRadius: 999,
                      padding: '7px 14px',
                      fontSize: 13,
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Loading follow-ups...
              </div>
            ) : visibleRows.length === 0 ? (
              <div
                style={{
                  border: '1px dashed #D6D3D1',
                  borderRadius: 18,
                  padding: 40,
                  textAlign: 'center',
                  color: '#78716C',
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 10 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1C1917' }}>
                  {filter === 'overdue'
                    ? 'No overdue follow-ups'
                    : filter === 'completed'
                      ? 'No completed follow-ups'
                      : filter === 'pending'
                        ? 'No pending follow-ups'
                        : 'No follow-ups yet'}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#78716C', lineHeight: 1.7 }}>
                  Follow-ups are created automatically from completed orders, so this queue stays tied to real customer activity.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {visibleRows.map((item) => {
                  const isDone = item.status === 'completed';
                  const isOverdue = item.status === 'pending' && item.dueDays < 0;
                  const tone = isDone ? '#FAFAF9' : isOverdue ? '#FFF7ED' : '#FFFFFF';

                  return (
                    <article
                      key={item.id}
                      style={{
                        border: `1px solid ${isOverdue ? '#FED7AA' : '#E7E5E4'}`,
                        borderRadius: 20,
                        padding: 18,
                        background: tone,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span
                              style={{
                                borderRadius: 999,
                                background: isDone ? '#ECFDF5' : isOverdue ? '#FEF3C7' : '#F5F5F4',
                                color: isDone ? '#166534' : isOverdue ? '#92400E' : '#57534E',
                                padding: '6px 10px',
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.03em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {dueTone(item.dueDays, item.status)}
                            </span>
                            <span style={{ fontSize: 12, color: '#A8A29E' }}>
                              Due {formatShortDate(item.dueDate)}
                            </span>
                            <span style={{ fontSize: 12, color: '#A8A29E' }}>•</span>
                            <span style={{ fontSize: 12, color: '#57534E', fontWeight: 700 }}>
                              {item.order.status.replaceAll('_', ' ')}
                            </span>
                          </div>

                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                              {item.customer.name}
                            </h3>
                            <span style={{ color: '#9CA3AF', fontSize: 13 }}>{item.customer.email}</span>
                          </div>

                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>
                            <span>{formatCurrency(item.order.total)} order</span>
                            <span>•</span>
                            <span>Event {formatShortDate(item.order.eventDate)}</span>
                            <span>•</span>
                            <span>Created {formatShortDate(item.createdAt)}</span>
                          </div>

                          {item.note ? (
                            <p
                              style={{
                                margin: '10px 0 0',
                                padding: '10px 12px',
                                borderRadius: 14,
                                background: '#FAFAF9',
                                borderLeft: '3px solid #E7E5E4',
                                color: '#57534E',
                                fontSize: 13,
                                lineHeight: 1.7,
                              }}
                            >
                              {item.note}
                            </p>
                          ) : null}
                        </div>

                        <div style={{ minWidth: 130, textAlign: 'right' }}>
                          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A8A29E', fontWeight: 800 }}>
                            Potential value
                          </div>
                          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: '#C2410C' }}>
                            {formatCurrency(item.order.total)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                        <button
                          type="button"
                          onClick={() => void toggleComplete(item)}
                          disabled={savingId === item.id}
                          style={{
                            borderRadius: 14,
                            border: 'none',
                            background: isDone ? '#FFFFFF' : '#1C1917',
                            color: isDone ? '#57534E' : '#FFFFFF',
                            padding: '9px 14px',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: savingId === item.id ? 'wait' : 'pointer',
                          }}
                        >
                          {savingId === item.id ? 'Saving...' : isDone ? 'Reopen' : 'Complete'}
                        </button>
                        <a
                          href={`/orders/${item.order.id}`}
                          style={{
                            borderRadius: 14,
                            border: '1px solid #E7E5E4',
                            background: '#FFFFFF',
                            color: '#57534E',
                            padding: '9px 14px',
                            fontSize: 13,
                            fontWeight: 800,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          View order
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(buildReminderCopy(item));
                          }}
                          style={{
                            borderRadius: 14,
                            border: '1px solid #E7E5E4',
                            background: '#FFFFFF',
                            color: '#57534E',
                            padding: '9px 14px',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Copy reminder
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside style={{ display: 'grid', gap: 14, position: 'sticky', top: 24 }}>
          <div
            style={{
              border: '1px solid #E7E5E4',
              borderRadius: 24,
              background: '#FFFFFF',
              padding: 18,
              boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', fontWeight: 800 }}>
              Customer watchlist
            </div>
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Dormant and high-value accounts
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#78716C', lineHeight: 1.7 }}>
              These are the customers most likely to respond to a nudge. Use them to seed the next campaign.
            </p>

            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {customers
                .filter((customer) => customer.orderCount > 0)
                .sort((a, b) => {
                  const aDays = daysSince(a.lastOrderDate);
                  const bDays = daysSince(b.lastOrderDate);
                  if (a.totalSpend !== b.totalSpend) return b.totalSpend - a.totalSpend;
                  return bDays - aDays;
                })
                .slice(0, 5)
                .map((customer) => {
                  const age = daysSince(customer.lastOrderDate);
                  const label =
                    age >= 90
                      ? 'Dormant'
                      : age >= 45
                        ? 'Cooling off'
                        : 'Warm';
                  return (
                    <div
                      key={customer.id}
                      style={{
                        border: '1px solid #E7E5E4',
                        borderRadius: 18,
                        background: '#FAFAF9',
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{customer.name}</div>
                          <div style={{ marginTop: 3, fontSize: 12, color: '#78716C' }}>
                            {customer.company || customer.email}
                          </div>
                        </div>
                        <span
                          style={{
                            borderRadius: 999,
                            background: label === 'Dormant' ? '#FEF3C7' : label === 'Cooling off' ? '#FFF7ED' : '#ECFDF5',
                            color: label === 'Dormant' ? '#92400E' : label === 'Cooling off' ? '#C2410C' : '#166534',
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#78716C' }}>
                        <span>{customer.orderCount} orders</span>
                        <span>{formatCurrency(customer.totalSpend)}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#A8A29E' }}>
                        Last order {formatShortDate(customer.lastOrderDate)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #E7E5E4',
              borderRadius: 24,
              background: '#FFFFFF',
              padding: 18,
              boxShadow: '0 18px 50px rgba(28,25,23,0.05)',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', fontWeight: 800 }}>
              Retention signals
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {radar.map((item) => (
                <div
                  key={item.title}
                  style={{
                    borderRadius: 18,
                    border: '1px solid #E7E5E4',
                    background: item.tone === 'accent' ? '#FFF7ED' : item.tone === 'warning' ? '#FFFBEB' : '#FAFAF9',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{item.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1C1917' }}>{item.count}</div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
