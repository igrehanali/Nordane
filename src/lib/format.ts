import { formatMoney, formatMoneyShort, type Money } from './money';
import type { RegionConfig } from './region';

/**
 * Region-aware formatting.
 *
 * Built once per request from the active region config and passed down, so no
 * component has to know which country it is rendering for. Swapping the region
 * changes currency, date order and address layout everywhere at once.
 */

export interface AddressParts {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
}

export interface Formatter {
  region: RegionConfig;
  money: (amount: Money, options?: { trimZeroCents?: boolean }) => string;
  moneyShort: (amount: Money) => string;
  date: (value: Date | string) => string;
  dateTime: (value: Date | string) => string;
  /** "3 days ago", "in 2 weeks" — for order timelines and invoice aging. */
  relative: (value: Date | string) => string;
  number: (value: number) => string;
  percentFromBps: (bps: number) => string;
  addressLines: (parts: AddressParts) => string[];
  addressOneLine: (parts: AddressParts) => string;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function joinNonEmpty(parts: (string | null | undefined)[], separator: string): string {
  return parts.filter((part) => part && part.trim().length > 0).join(separator);
}

export function createFormatter(region: RegionConfig): Formatter {
  const { locale, currency } = region;

  const dateFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
  const numberFormat = new Intl.NumberFormat(locale);
  const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  return {
    region,

    money: (amount, options) => formatMoney(amount, { locale, currency, ...options }),

    moneyShort: (amount) => formatMoneyShort(amount, { locale, currency }),

    date: (value) => dateFormat.format(toDate(value)),

    dateTime: (value) => dateTimeFormat.format(toDate(value)),

    relative: (value) => {
      const diffMs = toDate(value).getTime() - Date.now();
      const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 365 * 24 * 60 * 60 * 1_000],
        ['month', 30 * 24 * 60 * 60 * 1_000],
        ['week', 7 * 24 * 60 * 60 * 1_000],
        ['day', 24 * 60 * 60 * 1_000],
        ['hour', 60 * 60 * 1_000],
        ['minute', 60 * 1_000],
      ];
      for (const [unit, ms] of units) {
        if (Math.abs(diffMs) >= ms) return relativeFormat.format(Math.round(diffMs / ms), unit);
      }
      return relativeFormat.format(Math.round(diffMs / 1_000), 'second');
    },

    number: (value) => numberFormat.format(value),

    percentFromBps: (bps) => {
      const percent = bps / 100;
      const digits = Number.isInteger(percent) ? 0 : 1;
      return `${percent.toFixed(digits)}%`;
    },

    addressLines: (parts) => {
      // Each country writes the last lines differently, and getting it wrong is
      // the fastest way to look foreign on an invoice.
      const tail: (string | null | undefined)[] =
        region.code === 'US'
          ? [joinNonEmpty([joinNonEmpty([parts.city, parts.state], ', '), parts.postcode], ' ')]
          : region.code === 'AU'
            ? [joinNonEmpty([parts.city, parts.state, parts.postcode], ' ')]
            : [parts.city, parts.state, parts.postcode?.toUpperCase()];

      return [parts.line1, parts.line2, ...tail].filter(
        (line): line is string => typeof line === 'string' && line.trim().length > 0,
      );
    },

    addressOneLine: (parts) =>
      [parts.line1, parts.line2, parts.city, parts.state, parts.postcode]
        .filter(Boolean)
        .join(', '),
  };
}
