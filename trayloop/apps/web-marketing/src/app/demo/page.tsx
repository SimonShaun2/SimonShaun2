'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@trayloop/analytics';

const C = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  orangeSoft: '#FFF0E9',
  muted: '#7B6F65',
  white: '#FEFCFA',
  line: '#E8DDD1',
  success: '#1F8A5B',
  successBg: '#ECFAF3',
  error: '#C24B2A',
  errorBg: '#FFF3EE',
};

const DEMO_EMAIL = 'hello@trayloophq.com';
const HUBSPOT_PORTAL_ID = '245856247';
const HUBSPOT_FORM_ID = '1ace2de1-fd67-4b27-9d0b-07d724abacfc';
const HUBSPOT_SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

type Step = 1 | 2;

type DemoFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  restaurantName: string;
  consentToProcess: boolean;
};

type FieldErrors = Partial<Record<keyof DemoFormState, string>>;

const initialState: DemoFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  restaurantName: '',
  consentToProcess: false,
};

function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return '';
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

function validateStepOne(state: DemoFormState) {
  const errors: FieldErrors = {};

  if (!state.firstName.trim()) errors.firstName = 'First name is required.';
  if (!state.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!state.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!state.phone.trim()) errors.phone = 'Phone number is required.';

  return errors;
}

function validateStepTwo(state: DemoFormState) {
  const errors: FieldErrors = {};

  if (!state.city.trim()) errors.city = 'City is required.';
  if (!state.state.trim()) errors.state = 'State or region is required.';
  if (!state.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required.';
  if (!state.consentToProcess) errors.consentToProcess = 'Please agree before submitting.';

  return errors;
}

function StepDot({ active, complete, number, label }: { active: boolean; complete: boolean; number: string; label: string }) {
  const backgroundColor = complete || active ? C.orange : C.creamDark;
  const color = complete || active ? C.white : C.muted;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center', width: '100%' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div style={{ display: 'grid', gap: 6, alignItems: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: active ? C.ink : C.muted }}>{label}</div>
        <div style={{ height: 1, backgroundColor: C.line }} />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
}: {
  label: string;
  name: keyof DemoFormState;
  value: string;
  onChange: (name: keyof DemoFormState, value: string) => void;
  placeholder: string;
  error?: string;
  type?: 'text' | 'email' | 'tel';
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          borderRadius: 14,
          border: `1px solid ${error ? '#E9A085' : C.line}`,
          backgroundColor: C.white,
          padding: '16px 18px',
          fontSize: 17,
          color: C.ink,
          outline: 'none',
          boxShadow: error ? '0 0 0 3px rgba(232, 86, 24, 0.08)' : 'none',
        }}
      />
      {error ? <span style={{ fontSize: 13, color: C.error }}>{error}</span> : null}
    </label>
  );
}

export default function DemoPage() {
  const [step, setStep] = useState<Step>(1);
  const [formState, setFormState] = useState(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    trackEvent('marketing_demo_page_viewed', { placement: 'demo_page' });
  }, []);

  function updateField(name: keyof DemoFormState, value: string | boolean) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function moveToStepTwo() {
    const nextErrors = validateStepOne(formState);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep(2);
    trackEvent('marketing_demo_step_completed', { step: 1 });
  }

  async function submitToHubSpot() {
    const nextErrors = validateStepTwo(formState);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(HUBSPOT_SUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedAt: Date.now(),
          fields: [
            { objectTypeId: '0-1', name: 'firstname', value: formState.firstName.trim() },
            { objectTypeId: '0-1', name: 'lastname', value: formState.lastName.trim() },
            { objectTypeId: '0-1', name: 'email', value: formState.email.trim() },
            { objectTypeId: '0-1', name: 'phone', value: `+1 ${formState.phone.trim()}` },
            { objectTypeId: '0-1', name: 'city', value: formState.city.trim() },
            { objectTypeId: '0-1', name: 'state', value: formState.state.trim() },
            { objectTypeId: '0-1', name: 'company', value: formState.restaurantName.trim() },
          ],
          context: {
            hutk: getCookie('hubspotutk'),
            pageUri: typeof window !== 'undefined' ? window.location.href : 'https://trayloophq.com/demo',
            pageName: 'TrayLoop demo',
          },
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: 'I agree to allow TrayLoop to store and process my personal data.',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('HubSpot submission failed.');
      }

      trackEvent('marketing_demo_form_submitted', {
        placement: 'demo_page',
        restaurantName: formState.restaurantName.trim(),
      });

      setSubmitted(true);
      setStep(1);
      setFormState(initialState);
    } catch (error) {
      console.error(error);
      setSubmitError('The form could not be sent right now. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ backgroundColor: C.cream, minHeight: '100vh', padding: '72px 24px 96px' }}>
      <style>{`
        .tl-demo-shell {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 48px;
          align-items: start;
        }
        .tl-demo-proof {
          display: grid;
          gap: 16px;
          margin-top: 28px;
        }
        .tl-demo-card {
          background: ${C.white};
          border: 1px solid ${C.line};
          border-radius: 28px;
          padding: 38px;
          box-shadow: 0 22px 60px rgba(26, 22, 18, 0.06);
        }
        .tl-demo-fields-two {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 920px) {
          .tl-demo-shell {
            grid-template-columns: 1fr !important;
            max-width: 620px !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 768px) {
          .tl-demo-page {
            padding: 56px 18px 72px !important;
          }
          .tl-demo-title {
            font-size: 44px !important;
            line-height: 1.02 !important;
          }
          .tl-demo-copy {
            font-size: 17px !important;
            line-height: 1.65 !important;
          }
          .tl-demo-card {
            padding: 24px !important;
            border-radius: 22px !important;
          }
          .tl-demo-fields-two {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="tl-demo-page tl-demo-shell">
        <section style={{ paddingTop: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              backgroundColor: C.orangeSoft,
              color: C.orange,
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 20,
            }}
          >
            Free 30-min demo
          </div>

          <h1
            className="tl-demo-title"
            style={{
              fontSize: 66,
              lineHeight: 0.96,
              letterSpacing: '-0.05em',
              color: C.ink,
              fontWeight: 800,
              maxWidth: 620,
              marginBottom: 18,
            }}
          >
            See how Tray.Loop stops the commission bleed.
          </h1>

          <p
            className="tl-demo-copy"
            style={{
              maxWidth: 580,
              fontSize: 18,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            Book a quick call and we&apos;ll show you exactly how restaurants use TrayLoop to own their catering orders, without marketplace middlemen or commission drag.
          </p>

          <div className="tl-demo-proof">
            {[
              'Branded ordering page live within a week',
              'Zero per-order commissions, ever',
              'Automated reorder outreach built in',
              'No long-term contracts required',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    backgroundColor: C.orangeSoft,
                    color: C.orange,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="tl-demo-card">
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 14 }}>Book a free Demo</div>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: C.muted, marginBottom: 24 }}>
            We&apos;re excited to meet with you. This goes straight into HubSpot so the TrayLoop team can follow up quickly.
          </p>

          <div style={{ display: 'flex', gap: 18, marginBottom: 26 }}>
            <StepDot active={step === 1} complete={step === 2 || submitted} number="1" label="Your info" />
            <StepDot active={step === 2} complete={submitted} number="2" label="Your business" />
          </div>

          {submitted ? (
            <div
              style={{
                borderRadius: 22,
                border: `1px solid ${C.success}`,
                backgroundColor: C.successBg,
                padding: 24,
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>You&apos;re booked in our queue.</div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: C.muted }}>
                Your details were sent into HubSpot successfully. The team will follow up shortly at the email you provided.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              {step === 1 ? (
                <>
                  <div className="tl-demo-fields-two">
                    <Field
                      label="First Name"
                      name="firstName"
                      value={formState.firstName}
                      onChange={updateField}
                      placeholder="Jane"
                      error={errors.firstName}
                    />
                    <Field
                      label="Last Name"
                      name="lastName"
                      value={formState.lastName}
                      onChange={updateField}
                      placeholder="Smith"
                      error={errors.lastName}
                    />
                  </div>

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={updateField}
                    placeholder="jane@yourrestaurant.com"
                    error={errors.email}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'end' }}>
                    <div
                      style={{
                        height: 56,
                        borderRadius: 14,
                        border: `1px solid ${C.line}`,
                        backgroundColor: C.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 17,
                        fontWeight: 700,
                        color: C.ink,
                      }}
                    >
                      US +1
                    </div>
                    <Field
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={updateField}
                      placeholder="(555) 000-0000"
                      error={errors.phone}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={moveToStepTwo}
                    style={{
                      height: 56,
                      borderRadius: 999,
                      border: 'none',
                      backgroundColor: C.orange,
                      color: C.white,
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <div className="tl-demo-fields-two">
                    <Field
                      label="City"
                      name="city"
                      value={formState.city}
                      onChange={updateField}
                      placeholder="Austin"
                      error={errors.city}
                    />
                    <Field
                      label="State / Region"
                      name="state"
                      value={formState.state}
                      onChange={updateField}
                      placeholder="Texas"
                      error={errors.state}
                    />
                  </div>

                  <Field
                    label="Restaurant Name"
                    name="restaurantName"
                    value={formState.restaurantName}
                    onChange={updateField}
                    placeholder="Your restaurant"
                    error={errors.restaurantName}
                  />

                  <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={formState.consentToProcess}
                      onChange={(event) => updateField('consentToProcess', event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: 15, lineHeight: 1.6, color: C.muted }}>
                      I agree to allow TrayLoop to store and process my personal data.
                    </span>
                  </label>
                  {errors.consentToProcess ? <span style={{ fontSize: 13, color: C.error }}>{errors.consentToProcess}</span> : null}
                  {submitError ? (
                    <div
                      style={{
                        borderRadius: 16,
                        backgroundColor: C.errorBg,
                        border: `1px solid rgba(194, 75, 42, 0.2)`,
                        color: C.error,
                        padding: '14px 16px',
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {submitError}
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: '1 1 180px',
                        height: 54,
                        borderRadius: 999,
                        border: `1px solid ${C.line}`,
                        backgroundColor: C.white,
                        color: C.ink,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={submitToHubSpot}
                      disabled={isSubmitting}
                      style={{
                        flex: '2 1 260px',
                        height: 54,
                        borderRadius: 999,
                        border: 'none',
                        backgroundColor: C.orange,
                        color: C.white,
                        fontSize: 18,
                        fontWeight: 800,
                        cursor: isSubmitting ? 'wait' : 'pointer',
                        opacity: isSubmitting ? 0.72 : 1,
                      }}
                    >
                      {isSubmitting ? 'Sending…' : 'Book my demo'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <p
            style={{
              fontSize: 14,
              color: C.muted,
              textAlign: 'center',
              paddingTop: 22,
            }}
          >
            If the form does not submit,{' '}
            <a
              href={`mailto:${DEMO_EMAIL}`}
              style={{ color: C.orange, textDecoration: 'none', fontWeight: 700 }}
            >
              email us directly
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
