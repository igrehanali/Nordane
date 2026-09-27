import 'server-only';
import { and, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimitHits } from '@/db/schema';

/**
 * Fixed-window rate limiting, in Postgres.
 *
 * Protects the login form and the public forms from credential stuffing and from
 * someone hammering the quote form. A fixed window is slightly blunter than a
 * sliding one and needs no Redis, which at these volumes is the right trade.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimitRule {
  /** Namespaced subject, e.g. `login:ip:203.0.113.4` or `quote:ip:…`. */
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function consumeRateLimit(rule: RateLimitRule): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = rule.windowSeconds * 1_000;
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimitHits)
    .values({ key: rule.key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimitHits.key, rateLimitHits.windowStart],
      set: { count: sql`${rateLimitHits.count} + 1` },
    })
    .returning({ count: rateLimitHits.count });

  const count = row?.count ?? 1;
  const resetAt = windowStart.getTime() + windowMs;

  return {
    ok: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1_000)),
  };
}

/** Housekeeping, called by the nightly job. Windows older than a day are noise. */
export async function pruneRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1_000);
  const deleted = await db
    .delete(rateLimitHits)
    .where(and(lt(rateLimitHits.windowStart, cutoff)))
    .returning({ id: rateLimitHits.id });
  return deleted.length;
}

/**
 * Best-effort client address. Behind Vercel this is `x-forwarded-for`; locally it
 * falls back to a constant, which is fine because the limit is per key.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return headers.get('x-real-ip') ?? 'local';
}
