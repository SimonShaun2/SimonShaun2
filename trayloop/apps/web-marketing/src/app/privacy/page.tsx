import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | TrayLoop',
    description: 'Read the TrayLoop Privacy Policy to understand how we collect, use, and protect your data when you use our restaurant catering software platform.',
    alternates: {
          canonical: 'https://trayloophq.com/privacy',
    },
    openGraph: {
          title: 'Privacy Policy | TrayLoop',
          description: 'Read the TrayLoop Privacy Policy to understand how we collect, use, and protect your data.',
          url: 'https://trayloophq.com/privacy',
          siteName: 'TrayLoop',
          type: 'website',
    },
    robots: {
          index: true,
          follow: false,
    },
};

import type { CSSProperties } from 'react';

const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

function Section({
  children,
  bg = 'transparent',
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section style={{ backgroundColor: bg, padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

const headingStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: color.ink,
  marginBottom: 12,
  marginTop: 40,
};

const paragraphStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: color.muted,
  marginBottom: 16,
};

export default function PrivacyPage() {
  return (
    <>
      <Section bg={color.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.orange,
              textTransform: 'uppercase' as const,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            Legal
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: color.ink,
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: color.muted }}>Effective date: April 1, 2025</p>
        </div>
      </Section>

      <Section bg={color.white}>
        <p style={paragraphStyle}>
          TrayLoop, Inc. (&quot;TrayLoop,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the
          privacy of our users. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our platform, website, and related services
          (collectively, the &quot;Service&quot;).
        </p>

        <h2 style={headingStyle}>1. Information We Collect</h2>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Account Information:</strong> When you create an
          account, we collect your name, email address, phone number, business name, and billing
          information.
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Order Data:</strong> We collect information related
          to catering orders placed through the platform, including order contents, delivery
          addresses, scheduling details, and payment information.
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Usage Data:</strong> We automatically collect
          information about how you interact with the Service, including IP address, browser type,
          pages visited, time spent on pages, and referring URLs.
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Customer Data:</strong> If you are a restaurant using
          our platform, we process data about your catering customers on your behalf, including their
          names, email addresses, order history, and preferences.
        </p>

        <h2 style={headingStyle}>2. How We Use Information</h2>
        <p style={paragraphStyle}>We use the information we collect to:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Provide, maintain, and improve the Service',
            'Process transactions and send related communications',
            'Send automated follow-ups, reorder reminders, and marketing communications on your behalf',
            'Analyze usage patterns to improve platform performance and user experience',
            'Detect, prevent, and address technical issues and security threats',
            'Comply with legal obligations',
          ].map((item) => (
            <li key={item} style={{ ...paragraphStyle, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={headingStyle}>3. Data Sharing</h2>
        <p style={paragraphStyle}>
          We do not sell your personal information. We may share your information with:
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Service Providers:</strong> Third-party vendors who
          assist us in operating the platform, including payment processors (Stripe), email delivery
          services, and hosting providers.
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Business Transfers:</strong> In connection with a
          merger, acquisition, or sale of assets, your information may be transferred as part of the
          transaction.
        </p>
        <p style={paragraphStyle}>
          <strong style={{ color: color.ink }}>Legal Requirements:</strong> When required by law,
          regulation, or legal process, or to protect the rights, property, or safety of TrayLoop,
          our users, or others.
        </p>

        <h2 style={headingStyle}>4. Cookies</h2>
        <p style={paragraphStyle}>
          We use cookies and similar tracking technologies to collect usage data and improve the
          Service. You can control cookie preferences through your browser settings. Essential
          cookies are required for the platform to function properly. Analytics cookies help us
          understand how users interact with the Service.
        </p>

        <h2 style={headingStyle}>5. Data Security</h2>
        <p style={paragraphStyle}>
          We implement industry-standard security measures to protect your information, including
          encryption in transit (TLS) and at rest, regular security audits, and access controls.
          However, no method of transmission over the Internet or electronic storage is 100% secure,
          and we cannot guarantee absolute security.
        </p>

        <h2 style={headingStyle}>6. Your Rights</h2>
        <p style={paragraphStyle}>
          Depending on your location, you may have the right to:
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Access, correct, or delete your personal information',
            'Object to or restrict the processing of your data',
            'Request data portability',
            'Withdraw consent at any time where processing is based on consent',
            'Lodge a complaint with a supervisory authority',
          ].map((item) => (
            <li key={item} style={{ ...paragraphStyle, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
        <p style={paragraphStyle}>
          To exercise any of these rights, please contact us at the email address below.
        </p>

        <h2 style={headingStyle}>7. Data Retention</h2>
        <p style={paragraphStyle}>
          We retain your information for as long as your account is active or as needed to provide
          the Service. We may retain certain information after account closure as required by law or
          for legitimate business purposes, such as resolving disputes and enforcing agreements.
        </p>

        <h2 style={headingStyle}>8. Changes to This Policy</h2>
        <p style={paragraphStyle}>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by posting the updated policy on this page and updating the effective date. Your
          continued use of the Service after changes become effective constitutes acceptance of the
          revised policy.
        </p>

        <h2 style={headingStyle}>9. Contact Us</h2>
        <p style={paragraphStyle}>
          If you have questions about this Privacy Policy or our data practices, please contact us
          at:
        </p>
        <p style={{ ...paragraphStyle, fontWeight: 600, color: color.ink }}>
          privacy@trayloophq.com
        </p>
      </Section>
    </>
  );
}
