'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { trackEvent } from './events';

interface TrackedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  analyticsEvent?: string;
  analyticsProperties?: Record<string, string | number | boolean | null | undefined>;
  children: ReactNode;
}

export function TrackedLink({
  href,
  analyticsEvent,
  analyticsProperties,
  children,
  onClick,
  ...rest
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (analyticsEvent) {
      trackEvent(analyticsEvent, analyticsProperties);
    }
    onClick?.(event);
  }

  if (href.startsWith('http') || href.startsWith('#')) {
    return (
      <a href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
