import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const DESIGN_HOSTS = new Set(['design.trayloophq.com', 'www.design.trayloophq.com']);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase();

  if (!host || !DESIGN_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/design-partnership';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
