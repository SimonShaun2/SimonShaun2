'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import StorefrontAuthNav from './storefront-auth-nav';
import type { StorefrontData } from '../lib/api';

interface Props {
  merchant: StorefrontData['merchant'];
  locations: StorefrontData['locations'];
}

function formatServiceModeLabel(mode: string) {
  switch (mode) {
    case 'full_service':
      return 'Full Service';
    case 'on_site':
      return 'On-Site';
    case 'food_truck':
      return 'Food Truck';
    default:
      return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

function formatCurrencyAmount(cents: number) {
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function getLocationSummary(location: StorefrontData['locations'][number] | null, count: number) {
  if (!location) {
    return count > 1 ? `${count} locations available` : 'Storefront';
  }

  if (count > 1) {
    return `${location.name} • ${location.city}, ${location.state}`;
  }

  return `${location.city}, ${location.state}`;
}

export default function StorefrontBrandContext({ merchant, locations }: Props) {
  const searchParams = useSearchParams();
  const requestedLocationId = searchParams.get('location');

  const selectedLocation = useMemo(() => {
    if (!locations.length) {
      return null;
    }

    return locations.find((location) => location.slug === requestedLocationId) ?? locations[0];
  }, [locations, requestedLocationId]);

  const badges = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    const next: Array<{ label: string; value: string }> = [];

    if (selectedLocation.minimumOrderAmount > 0) {
      next.push({ label: 'Min Order', value: formatCurrencyAmount(selectedLocation.minimumOrderAmount) });
    }

    next.push({ label: 'Lead Time', value: `${selectedLocation.leadTimeHours}h advance` });

    next.push({ label: 'Deposit', value: selectedLocation.depositRequired ? 'Required' : 'Not required' });

    if (selectedLocation.deliveryEnabled && selectedLocation.deliveryRadiusMiles) {
      next.push({ label: 'Delivery', value: `${selectedLocation.deliveryRadiusMiles} mi radius` });
    }

    if (selectedLocation.serviceTypes.length > 0) {
      next.push({
        label: 'Service Modes',
        value: selectedLocation.serviceTypes.map(formatServiceModeLabel).join(', '),
      });
    }

    return next;
  }, [selectedLocation]);

  return (
    <>
      <header
        className="storefront-header"
        style={{
          background: '#1C1917',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="storefront-header-inner"
          style={{
            maxWidth: 1040,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div className="storefront-header-name" style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                display: 'block',
              }}
            >
              {merchant.name}
            </span>
            <span
              style={{
                color: '#D4A853',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                display: 'block',
                marginTop: 2,
              }}
            >
              {getLocationSummary(selectedLocation, locations.length)}
            </span>
          </div>
          <span
            style={{
              color: '#D6D3D1',
              fontSize: 13,
              fontWeight: 500,
              flex: 1,
              minWidth: 220,
            }}
          >
            {merchant.description || 'Catering & Events'}
          </span>
          <StorefrontAuthNav />
        </div>
      </header>

      {selectedLocation ? (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E7E5E4',
            padding: '0 24px',
          }}
        >
          <div
            className="storefront-policy-bar"
            style={{
              maxWidth: 1040,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              minHeight: 48,
              padding: '12px 0',
              overflowX: 'auto',
            }}
          >
            {badges.map((badge) => (
              <div key={`${badge.label}-${badge.value}`} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#78716C',
                  }}
                >
                  {badge.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1C1917',
                  }}
                >
                  {badge.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
