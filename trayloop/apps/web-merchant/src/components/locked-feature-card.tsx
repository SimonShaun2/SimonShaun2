'use client';

import {
  PLAN_DEFINITIONS,
  type FeatureKey,
  type PlanKey,
} from '@trayloop/types/src/plan-access';
import { useFeatureAccess } from './plan-access-provider';

interface LockedFeatureCardProps {
  title: string;
  description: string;
  featureKey: FeatureKey;
  bullets?: string[];
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
}

function planLabel(plan: PlanKey | null) {
  return plan ? PLAN_DEFINITIONS[plan].label : 'a higher plan';
}

export default function LockedFeatureCard({
  title,
  description,
  featureKey,
  bullets = [],
  ctaHref,
  ctaLabel,
  compact = false,
}: LockedFeatureCardProps) {
  const access = useFeatureAccess(featureKey);

  const resolvedHref = ctaHref ?? access.upgradeHref;
  const resolvedLabel = ctaLabel ?? access.upgradeLabel;

  return (
    <section
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 16,
        background: '#FFFFFF',
        padding: compact ? 18 : 24,
        boxShadow: '0 1px 2px rgba(28,25,23,0.04)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'rgba(232, 86, 24, 0.09)',
          color: '#B45309',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Locked feature
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: compact ? 20 : 24,
          lineHeight: 1.15,
          color: '#1C1917',
        }}
      >
        {title}
      </h2>

      <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.65, color: '#57534E', maxWidth: 700 }}>
        {description}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 18,
          marginBottom: bullets.length > 0 ? 18 : 0,
        }}
      >
        <StatTile label="Current plan" value={planLabel(access.currentPlan)} />
        <StatTile label="Required plan" value={planLabel(access.requiredPlan)} />
        <StatTile label="Upgrade path" value={planLabel(access.upgradePlan)} />
      </div>

      {bullets.length > 0 ? (
        <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
          {bullets.map((bullet) => (
            <div
              key={bullet}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                fontSize: 13,
                color: '#44403C',
              }}
            >
              <span style={{ color: '#E85618', fontWeight: 700 }}>&bull;</span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href={resolvedHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderRadius: 999,
            background: '#1C1917',
            color: '#FAFAF9',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {resolvedLabel}
        </a>
        <a
          href="/billing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 14px',
            borderRadius: 999,
            border: '1px solid #D6D3D1',
            color: '#44403C',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            background: '#FFFFFF',
          }}
        >
          View billing
        </a>
      </div>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 12, padding: '12px 14px', background: '#FAFAF9' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>{value}</div>
    </div>
  );
}
