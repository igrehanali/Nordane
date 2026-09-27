/**
 * Money.
 *
 * Every monetary value in this application is an integer number of MINOR units
 * (cents, pence). There are no floating point amounts, ever: `0.1 + 0.2` is not
 * 0.3, and a wholesaler's invoice that is one cent out is a support call.
 *
 * The `Money` type is branded so a raw `number` cannot be passed where an amount
 * is expected without going through `asMoney` / `parseMoney`, both of which
 * validate. Columns holding amounts are named `*_minor` for the same reason.
 *
 * Rounding is half-away-from-zero (the convention on a paper invoice) and is
 * applied once, at the point a derived amount is produced.
 */

declare const MoneyBrand: unique symbol;

export type Money = number & { readonly [MoneyBrand]: 'minor' };

/** Minor units per major unit. USD/GBP/AUD are all 100. */
export const MINOR_PER_MAJOR = 100;
const MINOR_DIGITS = 2;

/** Basis points: 10_000 bps = 100%. Discounts and tax rates are stored in bps. */
export type Bps = number;
export const BPS_SCALE = 10_000;

function roundHalfAwayFromZero(value: number): number {
  // Math.round is half-UP (−2.5 → −2), so mirror negatives to keep it symmetric.
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/** Wraps a raw integer of minor units as Money. Throws on anything unsafe. */
export function asMoney(minor: number): Money {
  if (!Number.isInteger(minor)) {
    throw new RangeError(`Money must be whole minor units, received ${minor}`);
  }
  if (!Number.isSafeInteger(minor)) {
    throw new RangeError(`Money out of safe integer range: ${minor}`);
  }
  return minor as Money;
}

export const ZERO: Money = asMoney(0);

/** True when the value is a usable Money amount. Use at trust boundaries. */
export function isMoney(value: unknown): value is Money {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

/**
 * Parses human or CSV input ("1,234.50", "$19.99", "12") into minor units
 * without ever touching a float for the significant digits. Input carrying more
 * precision than the currency has is rounded half-up on the third decimal.
 */
export function parseMoney(input: string): Money {
  const cleaned = input
    .trim()
    .replace(/[\s,\u00a0]/g, '')
    .replace(/^[^\d+.-]+/, '');

  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(cleaned);
  const whole = match?.[2] ?? '';
  const fraction = match?.[3] ?? '';
  if (!match || (whole === '' && fraction === '')) {
    throw new RangeError(`Not a valid amount: ${JSON.stringify(input)}`);
  }

  const sign = match[1] === '-' ? -1 : 1;
  const kept = fraction.slice(0, MINOR_DIGITS).padEnd(MINOR_DIGITS, '0');
  const roundUp = Number(fraction[MINOR_DIGITS] ?? '0') >= 5 ? 1 : 0;

  return asMoney(sign * (Number(whole || '0') * MINOR_PER_MAJOR + Number(kept) + roundUp));
}

export function addMoney(...amounts: Money[]): Money {
  return asMoney(amounts.reduce<number>((total, amount) => total + amount, 0));
}

export function subMoney(a: Money, b: Money): Money {
  return asMoney(a - b);
}

/** Money times a whole quantity. Quantities in this domain are never fractional. */
export function multiplyMoney(amount: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`Quantity must be a non-negative whole number, received ${quantity}`);
  }
  return asMoney(amount * quantity);
}

/** Takes `bps` off the amount. 1_500 bps = 15% off. */
export function applyDiscountBps(amount: Money, bps: Bps): Money {
  assertBps(bps);
  return asMoney(roundHalfAwayFromZero((amount * (BPS_SCALE - bps)) / BPS_SCALE));
}

/** The portion of an amount that `bps` represents — used for tax and margin. */
export function percentOfBps(amount: Money, bps: Bps): Money {
  assertBps(bps, { allowOver100: true });
  return asMoney(roundHalfAwayFromZero((amount * bps) / BPS_SCALE));
}

/** The discount, in bps, that `to` represents against `from`. For display only. */
export function discountBpsBetween(from: Money, to: Money): Bps {
  if (from <= 0) return 0;
  return roundHalfAwayFromZero(((from - to) / from) * BPS_SCALE);
}

export function minMoney(...amounts: Money[]): Money {
  if (amounts.length === 0) throw new RangeError('minMoney needs at least one amount');
  return amounts.reduce((lowest, amount) => (amount < lowest ? amount : lowest));
}

export function maxMoney(...amounts: Money[]): Money {
  if (amounts.length === 0) throw new RangeError('maxMoney needs at least one amount');
  return amounts.reduce((highest, amount) => (amount > highest ? amount : highest));
}

export function sumMoney<T>(items: readonly T[], pick: (item: T) => Money): Money {
  return asMoney(items.reduce<number>((total, item) => total + pick(item), 0));
}

/** Exact decimal string, built from integer digits. For CSV, PDFs and APIs. */
export function moneyToDecimalString(amount: Money): string {
  const sign = amount < 0 ? '-' : '';
  const absolute = Math.abs(amount);
  const major = Math.trunc(absolute / MINOR_PER_MAJOR);
  const minor = absolute % MINOR_PER_MAJOR;
  return `${sign}${major}.${String(minor).padStart(MINOR_DIGITS, '0')}`;
}

export interface MoneyFormatOptions {
  locale: string;
  currency: string;
  /** Drop the ".00" on whole amounts. Handy in dense tables, wrong on invoices. */
  trimZeroCents?: boolean;
}

export function formatMoney(amount: Money, options: MoneyFormatOptions): string {
  const whole = amount % MINOR_PER_MAJOR === 0;
  const digits = options.trimZeroCents && whole ? 0 : MINOR_DIGITS;
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount / MINOR_PER_MAJOR);
}

/** "$12.4k" — dashboard tiles only, never a document. */
export function formatMoneyShort(amount: Money, options: MoneyFormatOptions): string {
  const major = Math.abs(amount) / MINOR_PER_MAJOR;
  if (major < 10_000) return formatMoney(amount, { ...options, trimZeroCents: true });
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount / MINOR_PER_MAJOR);
}

function assertBps(bps: Bps, opts?: { allowOver100?: boolean }): void {
  const ceiling = opts?.allowOver100 ? Number.MAX_SAFE_INTEGER : BPS_SCALE;
  if (!Number.isInteger(bps) || bps < 0 || bps > ceiling) {
    throw new RangeError(`Basis points must be a whole number in range, received ${bps}`);
  }
}
