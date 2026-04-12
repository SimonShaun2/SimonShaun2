'use client';

import { useEffect, useMemo, useState } from 'react';
import LaunchStatusRail from '../../../components/launch-status-rail';
import { fetchCurrentOrganization, updateCurrentOrganization, type MerchantOrganization } from '../../../lib/api';
import { useMobile } from '../../../lib/use-mobile';

const SWATCHES = ['#E85618', '#D97706', '#0F766E', '#1D4ED8', '#7C3AED', '#BE123C'];
const FONT_OPTIONS = [
  {
    value: 'bricolage',
    label: 'Bricolage Grotesque',
    family: 'var(--font-display-bricolage), var(--font-body), sans-serif',
    tone: 'Bold, modern, confident',
  },
  {
    value: 'fraunces',
    label: 'Fraunces',
    family: 'var(--font-display-fraunces), Georgia, serif',
    tone: 'Editorial, premium, elevated',
  },
  {
    value: 'inter',
    label: 'Inter',
    family: 'var(--font-body), Inter, sans-serif',
    tone: 'Neutral, crisp, operational',
  },
] as const;

type DisplayFont = (typeof FONT_OPTIONS)[number]['value'];

function hexToSoftBackground(hex: string) {
  return `${hex}14`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

function deriveInitials(name: string | null | undefined) {
  const safe = (name || 'TrayLoop').trim();
  return safe
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function BrandPreview({
  title,
  organization,
  logoUrl,
  brandColor,
  displayFont,
}: {
  title: string;
  organization: Pick<MerchantOrganization, 'name' | 'description' | 'website' | 'phone'> | null;
  logoUrl: string;
  brandColor: string;
  displayFont: DisplayFont;
}) {
  const selectedFont =
    FONT_OPTIONS.find((option) => option.value === displayFont) ?? FONT_OPTIONS[0];
  const heroHeadline =
    organization?.description || 'Direct catering that feels premium before the first call.';
  const helperMeta = [organization?.website, organization?.phone]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 24,
        overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: '0 20px 40px rgba(28,25,23,0.08)',
      }}
    >
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#FAFAF9',
              border: '1px solid #E7E5E4',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={`${organization?.name ?? 'Storefront'} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 900, color: '#1C1917' }}>{deriveInitials(organization?.name)}</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C' }}>{title}</div>
            <div style={{ marginTop: 4, fontSize: 17, fontWeight: 800, color: '#1C1917', fontFamily: selectedFont.family }}>
              {organization?.name || 'Downtown Kitchen'}
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 999, background: hexToSoftBackground(brandColor), color: brandColor, padding: '7px 10px', fontSize: 11, fontWeight: 900 }}>
          Open
        </div>
      </div>

      <div style={{ padding: 18, background: `linear-gradient(135deg, ${brandColor}20 0%, rgba(28,25,23,0.92) 70%)` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#F0FDF4', color: '#166534', padding: '6px 10px', fontSize: 11, fontWeight: 800 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22C55E' }} />
          Accepting catering orders
        </div>
        <div style={{ marginTop: 14, fontSize: 32, lineHeight: 0.96, fontWeight: 800, letterSpacing: '-0.05em', color: '#FFFFFF', fontFamily: selectedFont.family, maxWidth: 420 }}>
          {heroHeadline}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
          {helperMeta || 'Delivery · Lead time · Min order · Trusted by repeat buyers'}
        </div>
      </div>

      <div style={{ padding: 18, display: 'grid', gap: 14, background: '#FCFBF8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: 12 }}>
          <div style={{ borderRadius: 18, border: '1px solid #E7E5E4', background: '#FFFFFF', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1C1917' }}>Executive Lunch Buffet</div>
                <div style={{ marginTop: 5, fontSize: 12, color: '#78716C' }}>Serves 12 to 16 · Top seller</div>
              </div>
              <div style={{ borderRadius: 999, background: hexToSoftBackground(brandColor), color: brandColor, padding: '4px 8px', fontSize: 10, fontWeight: 900 }}>
                Featured
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 24, fontWeight: 900, color: '#1C1917' }}>$299</div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#78716C' }}>
              The kind of package and pricing language customers will see immediately.
            </div>
          </div>
          <div style={{ borderRadius: 18, background: `linear-gradient(135deg, ${brandColor}, #1C1917)`, minHeight: 144 }} />
        </div>

        <div style={{ borderRadius: 18, border: `2px solid ${brandColor}`, background: '#FFFFFF', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: brandColor }}>
            Checkout recommendation
          </div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, color: '#1C1917' }}>Add coffee and tea service?</div>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: '#57534E' }}>
            Recommendations, recurring nudges, and smart add-ons all inherit this brand language.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontCustomizePage() {
  const isMobile = useMobile(980);
  const [organization, setOrganization] = useState<MerchantOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#E85618');
  const [displayFont, setDisplayFont] = useState<DisplayFont>('bricolage');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const current = await fetchCurrentOrganization();
        if (cancelled) return;
        setOrganization(current);
        setName(current.name ?? '');
        setDescription(current.description ?? '');
        setWebsite(current.website ?? '');
        setPhone(current.phone ?? '');
        setLogoUrl(current.logoUrl ?? '');
        setBrandColor(current.brandColor ?? '#E85618');
        setDisplayFont((current.displayFont ?? 'bricolage') as DisplayFont);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load storefront branding.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedFont = useMemo(
    () => FONT_OPTIONS.find((option) => option.value === displayFont) ?? FONT_OPTIONS[0],
    [displayFont],
  );

  const hasChanges = useMemo(() => {
    if (!organization) return false;
    return (
      name !== (organization.name ?? '') ||
      description !== (organization.description ?? '') ||
      website !== (organization.website ?? '') ||
      phone !== (organization.phone ?? '') ||
      logoUrl !== (organization.logoUrl ?? '') ||
      brandColor !== (organization.brandColor ?? '#E85618') ||
      displayFont !== ((organization.displayFont ?? 'bricolage') as DisplayFont)
    );
  }, [brandColor, description, displayFont, logoUrl, name, organization, phone, website]);

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    if (file.size > 2 * 1024 * 1024) {
      setError('Please upload a logo smaller than 2MB.');
      return;
    }

    const mime = file.type.toLowerCase();
    if (!['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg'].includes(mime)) {
      setError('Please upload a PNG, SVG, JPG, or WebP logo.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setLogoUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process logo upload.');
    }
  }

  function resetChanges() {
    if (!organization) return;
    setName(organization.name ?? '');
    setDescription(organization.description ?? '');
    setWebsite(organization.website ?? '');
    setPhone(organization.phone ?? '');
    setLogoUrl(organization.logoUrl ?? '');
    setBrandColor(organization.brandColor ?? '#E85618');
    setDisplayFont((organization.displayFont ?? 'bricolage') as DisplayFont);
    setError('');
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateCurrentOrganization({
        name,
        description: description || undefined,
        website: website || undefined,
        phone: phone || undefined,
        logoUrl: logoUrl || undefined,
        brandColor,
        displayFont,
      });

      setOrganization(updated);
      setName(updated.name ?? '');
      setDescription(updated.description ?? '');
      setWebsite(updated.website ?? '');
      setPhone(updated.phone ?? '');
      setLogoUrl(updated.logoUrl ?? '');
      setBrandColor(updated.brandColor ?? '#E85618');
      setDisplayFont((updated.displayFont ?? 'bricolage') as DisplayFont);
      setSuccess('Brand Studio changes are live on the storefront.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save storefront branding.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 0' }}>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>Loading Brand Studio...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 0 42px', display: 'grid', gap: 22 }}>
      <LaunchStatusRail contextLabel="Branding affects launch confidence, package conversion, and how premium the storefront feels to customers." />

      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: '#FFF2E8', color: '#E85618', padding: '7px 12px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800 }}>
          Brand Studio
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 42, lineHeight: 1.02, letterSpacing: '-0.05em', fontFamily: 'var(--font-display), var(--font-body), sans-serif' }}>
          Make your storefront unmistakably yours
        </h1>
        <p style={{ margin: '10px 0 0', maxWidth: 760, color: 'var(--muted)', fontSize: 16, lineHeight: 1.7 }}>
          This is where the merchant experience starts feeling premium. Tune the visual identity, the storefront voice, and the first impression customers get before they ever place an order.
        </p>
      </div>

      {error ? (
        <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', borderRadius: 16, padding: '14px 16px', fontSize: 14 }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#166534', borderRadius: 16, padding: '14px 16px', fontSize: 14 }}>
          {success}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 0.95fr) minmax(0, 1.05fr)', gap: 22, alignItems: 'start' }}>
        <section style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 28, padding: 28, display: 'grid', gap: 26 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C' }}>Identity controls</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1C1917' }}>Build the look before you publish it</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#57534E' }}>
              We&apos;re syncing both business information and visual style here so the storefront feels cohesive instead of stitched together.
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <Field label="Storefront name" helper="Use the name customers should recognize in their inbox, checkout, and repeat ordering flow.">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Downtown Kitchen" style={fieldInputStyle} />
            </Field>

            <Field label="Storefront description" helper="This line becomes the premium promise customers read first.">
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Premium corporate catering and event services." style={{ ...fieldInputStyle, minHeight: 96, resize: 'vertical', paddingTop: 14 }} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <Field label="Website" helper="Optional, but useful for credibility and repeat buyers.">
                <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://downtownkitchen.com" style={fieldInputStyle} />
              </Field>
              <Field label="Phone" helper="Show a direct line customers can trust if they need help.">
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(512) 555-0182" style={fieldInputStyle} />
              </Field>
            </div>
          </div>

          <Field label="Logo" helper="Upload a PNG, SVG, JPG, or WebP logo up to 2MB. Square crops look the cleanest in the storefront header.">
            <label
              style={{
                display: 'grid',
                gap: 12,
                padding: 20,
                borderRadius: 18,
                border: '1px dashed #D6D3D1',
                background: '#FCFBF8',
                cursor: 'pointer',
              }}
            >
              <input type="file" accept=".png,.svg,.jpg,.jpeg,.webp,image/png,image/svg+xml,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>Drop a logo here or click to upload</div>
              <div style={{ fontSize: 13, color: '#78716C' }}>This preview updates instantly so you can judge the fit before saving.</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 74, height: 74, borderRadius: 18, border: '1px solid var(--border)', background: '#FFFFFF', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Merchant logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 900, color: '#1C1917' }}>{deriveInitials(name)}</span>
                  )}
                </div>
                {logoUrl ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setLogoUrl('');
                    }}
                    style={{ border: '1px solid var(--border)', background: '#FFFFFF', borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>
            </label>
          </Field>

          <Field label="Brand color" helper="This drives your accents, featured states, recommendations, and action styling.">
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {SWATCHES.map((swatch) => {
                  const active = brandColor.toLowerCase() === swatch.toLowerCase();
                  return (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setBrandColor(swatch)}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 16,
                        border: active ? '3px solid #1A1612' : '1px solid rgba(26,22,18,0.08)',
                        background: swatch,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {active ? (
                        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 900 }}>✓</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 8 }}>
                  Custom hex
                </label>
                <input
                  value={brandColor}
                  onChange={(event) =>
                    setBrandColor(
                      event.target.value.startsWith('#')
                        ? event.target.value.slice(0, 7)
                        : `#${event.target.value.slice(0, 6)}`,
                    )
                  }
                  maxLength={7}
                  style={{ ...fieldInputStyle, width: 150 }}
                />
              </div>
            </div>
          </Field>

          <Field label="Display font" helper="Choose the tone your merchant brand should carry in the storefront headline moments.">
            <div style={{ display: 'grid', gap: 12 }}>
              {FONT_OPTIONS.map((option) => {
                const active = displayFont === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDisplayFont(option.value)}
                    style={{
                      borderRadius: 18,
                      border: active ? `2px solid ${brandColor}` : '1px solid var(--border)',
                      background: active ? hexToSoftBackground(brandColor) : '#FFFFFF',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#1C1917' }}>{option.label}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#78716C' }}>{option.tone}</div>
                    </div>
                    <div style={{ fontFamily: option.family, fontSize: 36, lineHeight: 1, letterSpacing: '-0.04em', color: '#1C1917' }}>Aa</div>
                  </button>
                );
              })}
            </div>
          </Field>
        </section>

        <section style={{ display: 'grid', gap: 18 }}>
          <div style={{ background: '#1C1917', borderRadius: 28, padding: 24, color: '#FAFAF9' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4A853' }}>
              Preview studio
            </div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 900, lineHeight: 1.02 }}>
              See the live brand before customers do
            </div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: '#E7E5E4' }}>
              We&apos;re showing the saved storefront next to the new version so the change feels deliberate, not abstract.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 18 }}>
              <StudioStat label="Brand readiness" value={hasChanges ? 'Unsaved updates' : 'Live'} sub={hasChanges ? 'Review before publishing' : 'Everything matches production'} />
              <StudioStat label="Accent" value={brandColor.toUpperCase()} sub="Primary storefront color" />
              <StudioStat label="Display tone" value={selectedFont.label} sub={selectedFont.tone} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
            <BrandPreview
              title="Current live"
              organization={organization}
              logoUrl={organization?.logoUrl ?? ''}
              brandColor={organization?.brandColor ?? '#E85618'}
              displayFont={(organization?.displayFont ?? 'bricolage') as DisplayFont}
            />
            <BrandPreview
              title="Next live"
              organization={{
                ...(organization ?? {
                  id: '',
                  slug: '',
                  name: '',
                  description: '',
                  website: '',
                  phone: '',
                  logoUrl: '',
                  brandColor: '',
                  displayFont: 'bricolage',
                }),
                name,
                description,
                website,
                phone,
              }}
              logoUrl={logoUrl}
              brandColor={brandColor}
              displayFont={displayFont}
            />
          </div>
        </section>
      </div>

      <div style={{ position: 'sticky', bottom: 0, zIndex: 3, background: 'rgba(250,250,249,0.94)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 22, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1917' }}>
            {hasChanges ? 'Ready to publish updated storefront branding' : 'No unpublished brand changes'}
          </div>
          <div style={{ fontSize: 12, color: '#78716C' }}>
            {hasChanges
              ? 'Save when the next-live preview feels right. Changes apply to the storefront immediately.'
              : 'Your current Brand Studio settings already match the live storefront.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={resetChanges}
            style={{ border: '1px solid var(--border)', background: '#FFFFFF', borderRadius: 14, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{ border: 'none', background: saving || !hasChanges ? '#A8A29E' : '#1A1612', color: '#FFFFFF', borderRadius: 14, padding: '12px 18px', fontWeight: 800, cursor: saving || !hasChanges ? 'default' : 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{label}</div>
        <div style={{ marginTop: 5, fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{helper}</div>
      </div>
      {children}
    </div>
  );
}

function StudioStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, background: 'rgba(255,255,255,0.04)', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A29E' }}>{label}</div>
      <div style={{ marginTop: 7, fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>{value}</div>
      <div style={{ marginTop: 5, fontSize: 12, color: '#D6D3D1', lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  borderRadius: 14,
  border: '1px solid var(--border)',
  padding: '0 14px',
  fontSize: 14,
  color: '#1C1917',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};
