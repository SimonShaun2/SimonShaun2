'use client';

import { usePathname } from 'next/navigation';
import { useMobile } from '../lib/use-mobile';
import { useLaunchStatus } from '../lib/use-launch-status';
import LaunchShellAside from './launch-shell-aside';

const HIDE_ROUTES = new Set(['/login', '/register', '/reset-password', '/support-access', '/launch', '/onboarding']);

export default function MerchantWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useMobile(1260);
  const { data, loading } = useLaunchStatus();
  const launchNeedsAttention = loading || !data || data.launch.blockers.length > 0;
  const showLaunchAside = !isMobile && pathname
    ? !HIDE_ROUTES.has(pathname) && !pathname.startsWith('/orders/') && launchNeedsAttention
    : false;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: showLaunchAside ? 'minmax(0, 1fr) 320px' : '1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ minWidth: 0 }}>{children}</div>
      {showLaunchAside ? <LaunchShellAside /> : null}
    </div>
  );
}
