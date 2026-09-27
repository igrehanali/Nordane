/**
 * Region configuration.
 *
 * One value decides currency, tax label and rate, date order, address labels and
 * units of measure. It is read from the `settings` table at runtime (falling back
 * to the REGION env var) so the same deployment can be demonstrated to a UK, US
 * or Australian distributor without a rebuild.
 *
 * Tax is deliberately a single configurable rate per branch rather than real
 * jurisdiction logic — see DECISIONS.md.
 */

import type { Bps } from './money';

export const REGION_CODES = ['US', 'UK', 'AU'] as const;
export type RegionCode = (typeof REGION_CODES)[number];

export interface RegionConfig {
  code: RegionCode;
  label: string;
  currency: 'USD' | 'GBP' | 'AUD';
  locale: string;
  /** Shown on carts, orders and invoices: "Sales Tax", "VAT", "GST". */
  taxLabel: string;
  /** Fallback rate when a branch has none set. Branch rate wins. */
  defaultTaxRateBps: Bps;
  /** Whether prices are customarily shown tax-inclusive to trade buyers. */
  pricesIncludeTax: boolean;
  dateFormat: string;
  dateTimeFormat: string;
  /** Field labels that differ by country and look wrong when they are not localised. */
  labels: {
    region: string;
    postcode: string;
    taxId: string;
    phoneHint: string;
    stateRequired: boolean;
  };
  unitSystem: 'imperial' | 'metric';
  /** Order of the address lines when rendering a formatted address block. */
  addressOrder: readonly ('line1' | 'line2' | 'city' | 'state' | 'postcode' | 'country')[];
}

export const REGIONS: Readonly<Record<RegionCode, RegionConfig>> = {
  US: {
    code: 'US',
    label: 'United States',
    currency: 'USD',
    locale: 'en-US',
    taxLabel: 'Sales Tax',
    defaultTaxRateBps: 700,
    pricesIncludeTax: false,
    dateFormat: 'MM/dd/yyyy',
    dateTimeFormat: 'MM/dd/yyyy h:mm a',
    labels: {
      region: 'State',
      postcode: 'ZIP code',
      taxId: 'EIN / resale certificate',
      phoneHint: '(555) 123-4567',
      stateRequired: true,
    },
    unitSystem: 'imperial',
    addressOrder: ['line1', 'line2', 'city', 'state', 'postcode', 'country'],
  },
  UK: {
    code: 'UK',
    label: 'United Kingdom',
    currency: 'GBP',
    locale: 'en-GB',
    taxLabel: 'VAT',
    defaultTaxRateBps: 2_000,
    pricesIncludeTax: false,
    dateFormat: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    labels: {
      region: 'County',
      postcode: 'Postcode',
      taxId: 'VAT number',
      phoneHint: '01234 567890',
      stateRequired: false,
    },
    unitSystem: 'metric',
    addressOrder: ['line1', 'line2', 'city', 'state', 'postcode', 'country'],
  },
  AU: {
    code: 'AU',
    label: 'Australia',
    currency: 'AUD',
    locale: 'en-AU',
    taxLabel: 'GST',
    defaultTaxRateBps: 1_000,
    pricesIncludeTax: false,
    dateFormat: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy h:mm a',
    labels: {
      region: 'State',
      postcode: 'Postcode',
      taxId: 'ABN',
      phoneHint: '(02) 5550 1234',
      stateRequired: true,
    },
    unitSystem: 'metric',
    addressOrder: ['line1', 'line2', 'city', 'state', 'postcode', 'country'],
  },
};

export const DEFAULT_REGION: RegionCode = 'US';

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === 'string' && (REGION_CODES as readonly string[]).includes(value);
}

export function resolveRegion(value: unknown): RegionConfig {
  return REGIONS[isRegionCode(value) ? value : DEFAULT_REGION];
}
