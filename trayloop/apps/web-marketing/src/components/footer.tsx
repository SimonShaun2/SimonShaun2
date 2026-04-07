import Link from 'next/link';
import PillButton from './pill-button';
import type { CSSProperties } from 'react';

const footerStyle: CSSProperties = {
  backgroundColor: '#1A1612',
  color: '#FEFCFA',
  padding: '48px 32px',
};

const innerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '24px',
};

const logoStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#FEFCFA',
};

const dotStyle: CSSProperties = {
  color: '#E85618',
};

const rightStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  flexWrap: 'wrap',
};

const copyrightStyle: CSSProperties = {
  fontSize: '14px',
  color: '#7B6F65',
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={logoStyle}>
          Tray<span style={dotStyle}>.</span>Loop
        </Link>

        <div style={rightStyle}>
          <PillButton
            text="Get started →"
            href="/signup"
            variant="primary"
            size="sm"
          />
          <span style={copyrightStyle}>
            &copy; 2025 TrayLoop. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
