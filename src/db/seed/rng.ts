/**
 * Deterministic pseudo-randomness.
 *
 * The demo data has to look organic — uneven order sizes, lumpy stock, customers
 * who order more than others — but it also has to be reproducible, or a
 * screenshot taken today will not match the data after tonight's reset. Same
 * seed, same database, every time.
 */
export class Rng {
  private state: number;

  constructor(seed = 0x5eed_1337) {
    this.state = seed >>> 0;
  }

  /** mulberry32 — small, fast, good enough for fixtures. */
  next(): number {
    this.state = (this.state + 0x6d2b_79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  }

  /** Inclusive integer in [min, max]. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** True with the given probability. */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    const item = items[Math.floor(this.next() * items.length)];
    if (item === undefined) throw new Error('Rng.pick called with an empty list');
    return item;
  }

  /** `count` distinct items, or all of them if the list is shorter. */
  sample<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const picked: T[] = [];
    while (picked.length < count && pool.length > 0) {
      picked.push(...pool.splice(Math.floor(this.next() * pool.length), 1));
    }
    return picked;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      const a = copy[i] as T;
      const b = copy[j] as T;
      copy[i] = b;
      copy[j] = a;
    }
    return copy;
  }

  /**
   * Skewed towards the low end — the shape of most real trade data. Order values,
   * line counts and stock holdings all cluster low with a long tail.
   */
  weightedInt(min: number, max: number, power = 2): number {
    const skewed = Math.pow(this.next(), power);
    return min + Math.floor(skewed * (max - min + 1));
  }
}
