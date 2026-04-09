'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCurrentOrganization, updateCurrentOrganization, type MerchantOrganization } from '../../../lib/api';

const SWATCHES = ['#E85618', '#D97706', '#0F766E', '#1D4ED8', '#7C3AED', '#BE123C'];
const FONT_OPTIONS = [
  { value: 'bricolage', label: 'Bricolage Grotesque', family: 'var(--font-display-bricolage), var(--font-body), sans-serif' },
  { value: 'fraunces', label: 'Fraunces', family: 'var(--font-display-fraunces), Georgia, serif' },
  { value: 'inter', label: 'Inter', family: 'var(--font-body), Inter, sans-serif' },
] as const;

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

export default function StorefrontCustomizePage() {
  const [organization, setOrganization] = useState<MerchantOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#E85618');
  const [displayFont, setDisplayFont] = useState<'bricolage' | 'fraunces' | 'inter'>('bricolage');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const current = await fetchCurrentOrganization();
        if (cancelled) return;
        setOrganization(current);
        setLogoUrl(current.logoUrl ?? '');
        setBrandColor(current.brandColor ?? '#E85618');
        setDisplayFont((current.displayFont ?? 'bricolage') as 'bricolage' | 'fraunces' | 'inter');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load storefront branding');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
      setError(err instanceof Error ? err.message : 'Unable to process logo upload');
    }
  }

  function resetChanges() {
    if (!organization) return;
    setLogoUrl(organization.logoUrl ?? '');
    setBrandColor(organization.brandColor ?? '#E85618');
    setDisplayFont((organization.displayFont ?? 'bricolage') as 'bricolage' | 'fraunces' | 'inter');
    setError('');
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateCurrentOrganization({
        logoUrl: logoUrl || undefined,
        brandColor,
        displayFont,
      });

      setOrganization(updated);
      setLogoUrl(updated.logoUrl ?? '');
      setBrandColor(updated.brandColor ?? '#E85618');
      setDisplayFont((updated.displayFont ?? 'bricolage') as 'bricolage' | 'fraunces' | 'inter');
      setSuccess('Storefront branding saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save storefront branding');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 0' }}>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>Loading storefront branding…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 0 40px', display: 'grid', gap: 20 }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: '#FFF2E8', color: '#E85618', padding: '7px 12px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800 }}>
          Merchant settings
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.05em', fontFamily: 'var(--font-display), var(--font-body), sans-serif' }}>
          Make your storefront yours
        </h1>
        <p style={{ margin: '10px 0 0', maxWidth: 720, color: 'var(--muted)', fontSize: 16, lineHeight: 1.7 }}>
          Customers see exactly what you brand. Logo, colors, and display font all update your live storefront.
        </p>
      </div>

      {error ? (
        <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', borderRadius: 14, padding: '14px 16px', fontSize: 14 }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#166534', borderRadius: 14, padding: '14px 16px', fontSize: 14 }}>
          {success}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <section style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 28, padding: 28 }}>
          <div style={{ display: 'grid', gap: 28 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Logo</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                Upload a PNG, SVG, JPG, or WebP logo up to 2MB. It will appear in the storefront header and hero.
              </p>
              <label
                style={{
                  display: 'grid',
                  gap: 12,
                  marginTop: 16,
                  padding: 20,
                  borderRadius: 18,
                  border: '1px dashed #D6D3D1',
                  background: '#FCFBF8',
                  cursor: 'pointer',
                }}
              >
                <input type="file" accept=".png,.svg,.jpg,.jpeg,.webp,image/png,image/svg+xml,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>Drop a logo here or click to upload</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Recommended square crop for the cleanest storefront header.</div>
                {logoUrl ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 18, border: '1px solid var(--border)', background: '#FFFFFF', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                      <img src={logoUrl} alt="Merchant logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
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
                  </div>
                ) : null}
              </label>
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Brand color</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                This drives your storefront accent color, trust pill, and highlights.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                {SWATCHES.map((swatch) => {
                  const active = brandColor.toLowerCase() === swatch.toLowerCase();
                  return (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setBrandColor(swatch)}
                      style={{
                        width: 44,
                        height: 44,
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
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
                  Custom hex
                </label>
                <input
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value.startsWith('#') ? event.target.value.slice(0, 7) : `#${event.target.value.slice(0, 6)}`)}
                  maxLength={7}
                  style={{ width: 140, height: 44, borderRadius: 12, border: '1px solid var(--border)', padding: '0 14px', fontSize: 15, fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Display font</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                Pick the font style used for the storefront brand name and hero headline.
              </p>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
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
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{option.label}</div>
                        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>Use this for your storefront display moments.</div>
                      </div>
                      <div style={{ fontFamily: option.family, fontSize: 34, lineHeight: 1, letterSpacing: '-0.04em' }}>Aa</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 28, padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--muted)' }}>
            Live preview
          </div>
          <div
            style={{
              marginTop: 16,
              border: '1px solid var(--border)',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#FCFBF8',
              boxShadow: '0 18px 50px rgba(26,22,18,0.08)',
              ['--brand' as string]: brandColor,
              ['--brand-bg' as string]: hexToSoftBackground(brandColor),
            }}
          >
            <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border)', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FFFFFF', border: '1px solid var(--border)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Preview logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 800, color: '#1A1612' }}>{organization?.name?.slice(0, 2).toUpperCase() ?? 'TL'}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontFamily: selectedFont.family, letterSpacing: '-0.04em', fontWeight: 800 }}>
                    {organization?.name ?? 'Your Storefront'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Direct-from-merchant catering</div>
                </div>
              </div>
              <div style={{ borderRadius: 999, background: 'var(--brand-bg)', color: 'var(--brand)', padding: '7px 10px', fontSize: 11, fontWeight: 800 }}>
                No marketplace fees
              </div>
            </div>

            <div style={{ position: 'relative', padding: 22, minHeight: 190, background: `linear-gradient(135deg, ${brandColor}22 0%, rgba(26,22,18,0.82) 72%)` }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: '#EAF8EF', color: '#166534', fontSize: 11, fontWeight: 800 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22C55E' }} />
                Accepting orders
              </div>
              <div style={{ marginTop: 18, maxWidth: 360 }}>
                <div style={{ fontFamily: selectedFont.family, fontSize: 34, lineHeight: 1.02, letterSpacing: '-0.05em', color: '#FFFFFF', fontWeight: 800 }}>
                  {organization?.description || 'Real catering, direct from your kitchen.'}
                </div>
                <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.82)', fontSize: 13 }}>
                  Delivery · Lead time · Min order · Response time
                </div>
              </div>
            </div>

            <div style={{ padding: 20, display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: 12, alignItems: 'stretch' }}>
                <div style={{ borderRadius: 18, border: '1px solid var(--border)', background: '#FFFFFF', padding: '16px 18px' }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>The Big Daddy Buffet</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    3 proteins · 3 large sides · hush puppies or cornbread
                  </div>
                  <div style={{ marginTop: 14, fontSize: 22, fontWeight: 800 }}>$36.00</div>
                </div>
                <div style={{ borderRadius: 18, background: `linear-gradient(135deg, ${brandColor}, #1A1612)`, minHeight: 140 }} />
              </div>

              <div style={{ borderRadius: 20, border: `2px solid ${brandColor}`, background: '#FFFFFF', padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: brandColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Live recommendation
                </div>
                <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800 }}>Add a coffee & tea service?</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  This is how your add-ons and smart upsells will feel inside the new storefront.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ position: 'sticky', bottom: 0, zIndex: 3, background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: 20, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
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
          disabled={saving}
          style={{ border: 'none', background: '#1A1612', color: '#FFFFFF', borderRadius: 14, padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
