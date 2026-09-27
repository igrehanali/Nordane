import 'server-only';
import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { env } from '@/lib/env';
import { createFormatter, type Formatter } from '@/lib/format';
import { resolveRegion, type RegionConfig, type RegionCode } from '@/lib/region';

/**
 * Runtime settings.
 *
 * The active region lives in the database so it can be switched from the back
 * office without a redeploy; the `REGION` env var is only the fallback for a
 * database that has not been seeded yet. Reads are memoised per request.
 */

export const REGION_SETTING_KEY = 'region';

export const getRegionConfig = cache(async (): Promise<RegionConfig> => {
  try {
    const [row] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, REGION_SETTING_KEY))
      .limit(1);

    const stored = row?.value as { code?: string } | undefined;
    if (stored?.code) return resolveRegion(stored.code);
  } catch {
    // Settings table missing or unreachable: fall back rather than 500 the page.
  }
  return resolveRegion(env.REGION);
});

/** Region-aware formatter for the current request. */
export const getFormatter = cache(async (): Promise<Formatter> => {
  return createFormatter(await getRegionConfig());
});

export async function setRegion(code: RegionCode, userId: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key: REGION_SETTING_KEY, value: { code }, updatedByUserId: userId })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: { code }, updatedByUserId: userId, updatedAt: new Date() },
    });
}
