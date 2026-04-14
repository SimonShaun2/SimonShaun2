'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import PillButton from '@/components/pill-button';

const C = {
    cream: '#F9F5EF',
    creamDark: '#F0EBE1',
    ink: '#1A1612',
    orange: '#E85618',
    teal: '#42D9A0',
    muted: '#7B6F65',
    white: '#FEFCFA',
    red: '#FF6243',
};

function Section({ children, bg = 'transparent', style }: { children: React.ReactNode; bg?: string; style?: CSSProperties }) {
    return (
          <section style={{ backgroundColor: bg, padding: '80px 24px', ...style }}>
                  <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>div>
          </section>section>
        );
}

function Label({ text, color = C.orange }: { text: string; color?: string }) {
    return (
          <div style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12 }}>
            {text}
          </div>div>
        );
}

function TealDot() {
    return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: C.teal, marginRight: 10, flexShrink: 0, marginTop: 7 }} />;
}

function BulletItem({ text }: { text: string }) {
    return (
          <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, listStyle: 'none' }}>
                  <TealDot />
                  <span style={{ color: C.ink, fontSize: 15, lineHeight: 1.5 }}>{text}</span>span>
          </li>li>
        );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
          <div style={{ backgroundColor: C.white, borderRadius: 12, padding: '20px 24px', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{q}</p>p>
                            <span style={{ fontSize: 20, color: C.muted, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 16 }}>+</span>span>
                  </div>div>
            {open && <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginTop: 12 }}>{a}</p>p>}
          </div>div>
        );
}

const faqs = [
  { q: 'How does TrayLoop differ from catering marketplaces?', a: 'Marketplaces own the customer relationship and charge 20-30% commissions on every order. TrayLoop gives you a branded direct ordering channel where you keep 100% of your revenue minus only a flat $49/month and 5% processing fee.' },
  { q: 'How long does setup take?', a: 'Most restaurants are live within 48 hours. Our team handles menu setup, branding, and technical configuration so you can focus on cooking.' },
  { q: 'Do I need technical skills to use TrayLoop?', a: 'Not at all. We handle the full setup and your dashboard is designed to be as simple as checking your email.' },
  { q: 'What does the AI actually do?', a: 'Our AI detects reorder patterns, predicts when customers are likely to order again, flags at-risk accounts before they churn, and generates personalized follow-up messages.' },
  { q: 'How does TrayLoop make money if there are no commissions?', a: 'We charge a flat $49/month subscription plus 5% payment processing. That is the entire cost.' },
  { q: 'Can I still use marketplaces alongside TrayLoop?', a: 'Absolutely. TrayLoop is additive, not a replacement. Keep your existing marketplace presence while building a direct channel that you own and control.' },
  { q: 'What happens if I cancel?', a: 'There are no contracts and no cancellation fees. You can cancel any time from your dashboard.' },
  ];

export default function HowItWorksContent() {
    return (
          <>
                <Section bg={C.cream} style={{ paddingTop: 100, paddingBottom: 60 }}>
                        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
                                  <Label text="Product" />
                                  <h1 style={{ fontSize: 46, fontWeight: 800, color: C.ink, lineHeight: 1.15, marginBottom: 20 }}>
                                              The System Behind Every High-Performing Catering Program
                                  </h1>h1>
                                  <p style={{ fontSize: 18, lineHeight: 1.6, color: C.muted, marginBottom: 48 }}>
                                              Most restaurants have catering orders. Few have catering infrastructure. TrayLoop is the operating system that turns scattered orders into a predictable, growing revenue stream.
                                  </p>p>
                                  <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {[{ value: '100%', label: 'of revenue stays yours' }, { value: '3x', label: 'repeat order rate' }, { value: '100%', label: 'done-for-you setup' }].map((s) => (
                          <div key={s.label} style={{ textAlign: 'center', flex: '0 1 200px' }}>
                                          <div style={{ fontSize: 40, fontWeight: 800, color: C.ink }}>{s.value}</div>div>
                                          <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{s.label}</div>div>
                          </div>div>
                        ))}
                                  </div>div>
                        </div>div>
                </Section>Section>
                <Section bg={C.cream} style={{ paddingTop: 40 }}>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                  <PillButton text="Book a free Demo" href="/demo" variant="primary" />
                                  <PillButton text="See pricing" href="/pricing" variant="ghost" />
                        </div>div>
                </Section>Section>
                <Section bg={C.cream}>
                        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  <Label text="FAQ" />
                          {faqs.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
                        </div>div>
                </Section>Section>
          </>>
        );
}</>
