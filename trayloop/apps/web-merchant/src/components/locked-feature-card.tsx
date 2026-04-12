'use client';

import {
  type FeatureKey,
  type PlanKey,
} from '@trayloop/types/src/plan-access';
import { useFeatureAccess } from './plan-access-provider';
import { getLockedFeaturePresentation } from '../lib/feature-access-display';
import { getMerchantPlanLabel } from '../lib/plan-copy';

interface LockedFeatureCardProps {
  title: string;
  description: string;
  featureKey: FeatureKey;
  bullets?: string[];
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
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
  const presentation = getLockedFeaturePresentation({
    featureKey,
    currentPlan: access.currentPlan,
    enabled: access.enabled,
    included: access.included,
    requiredPlan: access.requiredPlan,
    upgradePlan: access.upgradePlan,
    ctaHref: ctaHref ?? access.upgradeHref,
    ctaLabel: ctaLabel ?? access.upgradeLabel,
  });

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

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
        <StatTile label="Current plan" value={planLabel(access.currentPlan, 'Not assigned')} />
        <StatTile label="Availability" value={presentation.availabilityLabel} />
        <StatTile label="Unlocks on" value={presentation.unlocksOnLabel} />
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
        <StatTile label="Required plan" value={planLabel(access.requiredPlan, 'Billing add-on')} />
        <StatTile label="Upgrade path" value={planLabel(access.upgradePlan, 'Billing add-on')} />
        <StatTile label="Feature" value={presentation.featureLabel} />
      </div>

      <div style={{ marginTop: 2, padding: '12px 14px', borderRadius: 12, background: '#FAFAF9', border: '1px solid #EEEAE4', fontSize: 13, color: '#57534E', lineHeight: 1.6 }}>
        <strong style={{ color: '#1C1917' }}>{presentation.availabilityLabel}:</strong> {presentation.availabilityDetail}
        {presentation.currentPlanLabel ? ` You are currently on ${presentation.currentPlanLabel}.` : null}
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
          href={presentation.ctaHref}
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
          {presentation.ctaLabel}
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

function planLabel(plan: PlanKey | null, fallback: string) {
  return plan ? getMerchantPlanLabel(plan) : fallback;
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
