'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { trackEvent } from '@trayloop/analytics';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

interface PillButtonProps {
  text: string;
  href: string;
  variant?: Variant;
  size?: Size;
  analyticsEvent?: string;
  analyticsProperties?: Record<string, string | number | boolean | null | undefined>;
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    backgroundColor: '#E85618',
    color: '#FEFCFA',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#1A1612',
    color: '#FEFCFA',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#7B6F65',
    border: '1.5px solid #7B6F65',
  },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: {
    padding: '8px 18px',
    fontSize: '14px',
  },
  md: {
    padding: '12px 28px',
    fontSize: '16px',
  },
};

export default function PillButton({
  text,
  href,
  variant = 'primary',
  size = 'md',
  analyticsEvent,
  analyticsProperties,
}: PillButtonProps) {
  function handleClick() {
    if (analyticsEvent) {
      trackEvent(analyticsEvent, {
        href,
        ...analyticsProperties,
      });
    }
  }

  const style: CSSProperties = {
    display: 'inline-block',
    borderRadius: '999px',
    fontWeight: 600,
    lineHeight: 1.4,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease, transform 0.15s ease',
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  if (href.startsWith('http')) {
    return (
      <a href={href} style={style} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {text}
      </a>
    );
  }

  return (
    <Link href={href} style={style} onClick={handleClick}>
      {text}
    </Link>
  );
}
