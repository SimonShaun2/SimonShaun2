'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { trackEvent } from '@trayloop/analytics';
import PillButton from './pill-button';

const NAV_HEIGHT = 64;

const navStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  height: NAV_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  backgroundColor: 'rgba(249, 245, 239, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(26, 22, 18, 0.06)',
};

const logoStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 800,
  color: '#1A1612',
  letterSpacing: '-0.02em',
};

const dotStyle: CSSProperties = {
  color: '#E85618',
};

const desktopLinksStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
};

const linkStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 500,
  color: '#7B6F65',
  transition: 'color 0.15s ease',
};

const hamburgerStyle: CSSProperties = {
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  flexDirection: 'column',
  gap: '5px',
};

const barStyle: CSSProperties = {
  display: 'block',
  width: '22px',
  height: '2px',
  backgroundColor: '#1A1612',
  borderRadius: '2px',
  transition: 'transform 0.2s ease, opacity 0.2s ease',
};

const mobileMenuStyle: CSSProperties = {
  display: 'none',
  position: 'fixed',
  top: NAV_HEIGHT,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(249, 245, 239, 0.97)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '32px',
  flexDirection: 'column',
  gap: '24px',
  zIndex: 999,
};

const mobileLinkStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 500,
  color: '#1A1612',
};

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .nav-mobile-menu-open {
          display: flex !important;
        }
      `}</style>

      <nav style={navStyle}>
        <Link href="/" style={logoStyle}>
          Tray<span style={dotStyle}>.</span>Loop
        </Link>

        <div className="nav-desktop-links" style={desktopLinksStyle}>
          <Link href="/product" style={linkStyle}>
            Product
          </Link>
          <Link href="/how-it-works" style={linkStyle}>
            How It Works
          </Link>
          <Link href="/pricing" style={linkStyle}>
            Pricing
          </Link>
          <a
            href="https://dashboard.trayloophq.com/login"
            style={linkStyle}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('marketing_login_click', { placement: 'nav_desktop' })}
          >
            Login
          </a>
          <PillButton
            text="Get Started"
            href="https://dashboard.trayloophq.com/register"
            variant="secondary"
            size="sm"
            analyticsEvent="marketing_register_click"
            analyticsProperties={{ placement: 'nav_desktop' }}
          />
          <PillButton
            text="Book a free Demo ->"
            href="/demo"
            variant="primary"
            size="sm"
            analyticsEvent="marketing_demo_click"
            analyticsProperties={{ placement: 'nav_desktop' }}
          />
        </div>

        <button
          className="nav-hamburger"
          style={hamburgerStyle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            style={{
              ...barStyle,
              transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }}
          />
          <span
            style={{
              ...barStyle,
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              ...barStyle,
              transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }}
          />
        </button>
      </nav>

      <div
        className={mobileOpen ? 'nav-mobile-menu-open' : ''}
        style={mobileMenuStyle}
      >
        <Link
          href="/product"
          style={mobileLinkStyle}
          onClick={() => setMobileOpen(false)}
        >
          Product
        </Link>
        <Link
          href="/how-it-works"
          style={mobileLinkStyle}
          onClick={() => setMobileOpen(false)}
        >
          How It Works
        </Link>
        <Link
          href="/pricing"
          style={mobileLinkStyle}
          onClick={() => setMobileOpen(false)}
        >
          Pricing
        </Link>
        <a
          href="https://dashboard.trayloophq.com/login"
          style={mobileLinkStyle}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent('marketing_login_click', { placement: 'nav_mobile' });
            setMobileOpen(false);
          }}
        >
          Login
        </a>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PillButton
            text="Get Started"
            href="https://dashboard.trayloophq.com/register"
            variant="secondary"
            size="md"
            analyticsEvent="marketing_register_click"
            analyticsProperties={{ placement: 'nav_mobile' }}
          />
          <PillButton
            text="Book a free Demo ->"
            href="/demo"
            variant="primary"
            size="md"
            analyticsEvent="marketing_demo_click"
            analyticsProperties={{ placement: 'nav_mobile' }}
          />
        </div>
      </div>
    </>
  );
}
