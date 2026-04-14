import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | TrayLoop',
    description: 'Review the TrayLoop Terms of Service governing your use of our restaurant catering software, direct ordering platform, and related services.',
    alternates: {
          canonical: 'https://trayloophq.com/terms',
    },
    openGraph: {
          title: 'Terms of Service | TrayLoop',
          description: 'Review the TrayLoop Terms of Service governing your use of our restaurant catering software.',
          url: 'https://trayloophq.com/terms',
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

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: color.muted }}>Effective date: April 1, 2025</p>
        </div>
      </Section>

      <Section bg={color.white}>
        <p style={paragraphStyle}>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the TrayLoop platform,
          website, and related services (collectively, the &quot;Service&quot;) provided by TrayLoop, Inc.
          (&quot;TrayLoop,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service, you agree to be
          bound by these Terms.
        </p>

        <h2 style={headingStyle}>1. Acceptance of Terms</h2>
        <p style={paragraphStyle}>
          By creating an account or using the Service, you confirm that you are at least 18 years
          old and have the legal authority to enter into these Terms on behalf of yourself or the
          entity you represent. If you do not agree to these Terms, you may not use the Service.
        </p>

        <h2 style={headingStyle}>2. Description of Service</h2>
        <p style={paragraphStyle}>
          TrayLoop provides a software platform that enables restaurants to manage and grow their
          catering operations. The Service includes a branded online storefront for direct catering
          orders, automated customer follow-up and re-engagement tools, order management,
          AI-assisted analytics, deposit collection, and related features.
        </p>

        <h2 style={headingStyle}>3. Account Registration</h2>
        <p style={paragraphStyle}>
          To use the Service, you must create an account and provide accurate, complete, and current
          information. You are responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account. You agree to notify us
          immediately of any unauthorized use of your account.
        </p>

        <h2 style={headingStyle}>4. Fees and Payment</h2>
        <p style={paragraphStyle}>
          The Service is offered on a subscription basis at <strong style={{ color: color.ink }}>$49
          per month</strong> plus a <strong style={{ color: color.ink }}>5% platform fee</strong> on
          all orders processed through the platform. Fees are billed monthly in advance. The
          platform fee is calculated on the total order value (excluding taxes) and is deducted
          automatically.
        </p>
        <p style={paragraphStyle}>
          All fees are non-refundable except as expressly stated in these Terms. We reserve the
          right to change our pricing with 30 days&apos; written notice. Continued use of the Service
          after a price change constitutes acceptance of the new pricing.
        </p>

        <h2 style={headingStyle}>5. Cancellation</h2>
        <p style={paragraphStyle}>
          You may cancel your subscription at any time through your account settings or by
          contacting us. Cancellation takes effect at the end of your current billing period. You
          will retain access to the Service until the end of the paid period. We do not offer
          prorated refunds for partial months.
        </p>
        <p style={paragraphStyle}>
          Upon cancellation, your storefront will be deactivated and your data will be retained for
          30 days. After 30 days, your data may be permanently deleted. You may request a data export
          before your account is deleted.
        </p>

        <h2 style={headingStyle}>6. Acceptable Use</h2>
        <p style={paragraphStyle}>
          You agree not to use the Service to: violate any applicable law or regulation; infringe on
          the intellectual property rights of others; transmit malicious code or interfere with the
          operation of the Service; collect personal information of other users without their
          consent; or engage in any activity that could harm TrayLoop, its users, or third parties.
        </p>

        <h2 style={headingStyle}>7. Intellectual Property</h2>
        <p style={paragraphStyle}>
          The Service, including all software, designs, text, graphics, and other content, is owned
          by TrayLoop and protected by copyright, trademark, and other intellectual property laws.
          You are granted a limited, non-exclusive, non-transferable license to use the Service for
          your internal business purposes during the term of your subscription.
        </p>
        <p style={paragraphStyle}>
          You retain ownership of all content you upload to the Service, including menus, images,
          and business information. By uploading content, you grant TrayLoop a non-exclusive license
          to use, display, and distribute that content solely for the purpose of providing the
          Service.
        </p>

        <h2 style={headingStyle}>8. Limitation of Liability</h2>
        <p style={paragraphStyle}>
          To the maximum extent permitted by law, TrayLoop shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including but not limited to loss
          of profits, revenue, data, or business opportunities, arising out of or related to your
          use of the Service.
        </p>
        <p style={paragraphStyle}>
          Our total liability for any claims arising out of or related to these Terms or the Service
          shall not exceed the amount you paid to TrayLoop in the twelve (12) months preceding the
          claim.
        </p>

        <h2 style={headingStyle}>9. Indemnification</h2>
        <p style={paragraphStyle}>
          You agree to indemnify and hold harmless TrayLoop, its officers, directors, employees, and
          agents from any claims, liabilities, damages, losses, and expenses (including reasonable
          legal fees) arising out of your use of the Service, violation of these Terms, or
          infringement of any third-party rights.
        </p>

        <h2 style={headingStyle}>10. Governing Law</h2>
        <p style={paragraphStyle}>
          These Terms are governed by and construed in accordance with the laws of the State of
          Delaware, without regard to its conflict of law provisions. Any disputes arising out of or
          related to these Terms shall be resolved exclusively in the state or federal courts located
          in Wilmington, Delaware.
        </p>

        <h2 style={headingStyle}>11. Changes to These Terms</h2>
        <p style={paragraphStyle}>
          We may update these Terms from time to time. We will notify you of material changes by
          posting the updated Terms on this page and updating the effective date. Your continued use
          of the Service after changes become effective constitutes acceptance of the revised Terms.
        </p>

        <h2 style={headingStyle}>12. Contact Us</h2>
        <p style={paragraphStyle}>
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <p style={{ ...paragraphStyle, fontWeight: 600, color: color.ink }}>
          legal@trayloophq.com
        </p>
      </Section>
    </>
  );
}
