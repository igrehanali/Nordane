import { describe, expect, it } from 'vitest';
import {
  addMoney,
  applyDiscountBps,
  asMoney,
  discountBpsBetween,
  formatMoney,
  formatMoneyShort,
  moneyToDecimalString,
  multiplyMoney,
  parseMoney,
  percentOfBps,
  subMoney,
  sumMoney,
} from './money';

describe('asMoney', () => {
  it('rejects fractional minor units', () => {
    expect(() => asMoney(10.5)).toThrow(RangeError);
  });

  it('rejects values beyond safe integers', () => {
    expect(() => asMoney(Number.MAX_SAFE_INTEGER + 2)).toThrow(RangeError);
  });
});

describe('parseMoney', () => {
  it.each([
    ['12.34', 1234],
    ['12', 1200],
    ['0.05', 5],
    ['.5', 50],
    ['1,234.50', 123450],
    ['$19.99', 1999],
    ['  7.5  ', 750],
    ['-3.20', -320],
  ])('parses %s to %d minor units', (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it('rounds sub-cent precision half-up instead of truncating', () => {
    expect(parseMoney('1.005')).toBe(101);
    expect(parseMoney('1.004')).toBe(100);
  });

  it('rejects junk', () => {
    expect(() => parseMoney('')).toThrow(RangeError);
    expect(() => parseMoney('abc')).toThrow(RangeError);
    expect(() => parseMoney('1.2.3')).toThrow(RangeError);
  });
});

describe('arithmetic', () => {
  it('has no float drift where decimals would', () => {
    // 0.1 + 0.2 !== 0.3 in floats; in minor units it is exact.
    expect(addMoney(parseMoney('0.10'), parseMoney('0.20'))).toBe(30);
  });

  it('multiplies a price by a quantity exactly', () => {
    // 19.99 * 3 = 59.97, which floats render as 59.969999999999999
    expect(multiplyMoney(parseMoney('19.99'), 3)).toBe(5997);
  });

  it('refuses fractional quantities', () => {
    expect(() => multiplyMoney(asMoney(100), 1.5)).toThrow(RangeError);
    expect(() => multiplyMoney(asMoney(100), -1)).toThrow(RangeError);
  });

  it('subtracts and sums', () => {
    expect(subMoney(asMoney(1000), asMoney(250))).toBe(750);
    expect(sumMoney([{ v: asMoney(10) }, { v: asMoney(32) }], (r) => r.v)).toBe(42);
  });
});

describe('applyDiscountBps', () => {
  it('applies whole percentages', () => {
    expect(applyDiscountBps(asMoney(10_000), 1_500)).toBe(8_500);
  });

  it('rounds half away from zero', () => {
    // 1.25 less 10% = 1.125 -> 1.13, not 1.12
    expect(applyDiscountBps(asMoney(125), 1_000)).toBe(113);
  });

  it('handles the boundaries', () => {
    expect(applyDiscountBps(asMoney(999), 0)).toBe(999);
    expect(applyDiscountBps(asMoney(999), 10_000)).toBe(0);
  });

  it('rejects impossible discounts', () => {
    expect(() => applyDiscountBps(asMoney(100), 10_001)).toThrow(RangeError);
    expect(() => applyDiscountBps(asMoney(100), -1)).toThrow(RangeError);
    expect(() => applyDiscountBps(asMoney(100), 12.5)).toThrow(RangeError);
  });
});

describe('percentOfBps', () => {
  it('computes tax', () => {
    // 7% sales tax on 124.95
    expect(percentOfBps(asMoney(12_495), 700)).toBe(875);
  });

  it('computes 20% VAT', () => {
    expect(percentOfBps(asMoney(12_495), 2_000)).toBe(2_499);
  });
});

describe('discountBpsBetween', () => {
  it('reports the saving for display', () => {
    expect(discountBpsBetween(asMoney(10_000), asMoney(7_550))).toBe(2_450);
  });

  it('is safe on a zero list price', () => {
    expect(discountBpsBetween(asMoney(0), asMoney(0))).toBe(0);
  });
});

describe('formatting', () => {
  it('produces an exact decimal string without Intl', () => {
    expect(moneyToDecimalString(asMoney(123_450))).toBe('1234.50');
    expect(moneyToDecimalString(asMoney(5))).toBe('0.05');
    expect(moneyToDecimalString(asMoney(-320))).toBe('-3.20');
    expect(moneyToDecimalString(asMoney(0))).toBe('0.00');
  });

  it('formats per region', () => {
    const amount = asMoney(124_995);
    expect(formatMoney(amount, { locale: 'en-US', currency: 'USD' })).toBe('$1,249.95');
    expect(formatMoney(amount, { locale: 'en-GB', currency: 'GBP' })).toBe('£1,249.95');
  });

  it('trims zero cents only when asked', () => {
    const amount = asMoney(4_500);
    expect(formatMoney(amount, { locale: 'en-US', currency: 'USD' })).toBe('$45.00');
    expect(formatMoney(amount, { locale: 'en-US', currency: 'USD', trimZeroCents: true })).toBe(
      '$45',
    );
  });

  it('compacts large amounts for dashboard tiles', () => {
    expect(formatMoneyShort(asMoney(1_284_300), { locale: 'en-US', currency: 'USD' })).toBe('$12.8K');
    expect(formatMoneyShort(asMoney(4_500), { locale: 'en-US', currency: 'USD' })).toBe('$45');
  });
});
