import { documentCounters, settings } from '../schema';
import { createSeedDb } from './connection';
import { seedOrganisation } from './org';
import { truncateAll } from './truncate';
import { Rng } from './rng';

/**
 * Demo data.
 *
 * Wipes and rebuilds the whole dataset from a fixed seed, so it is identical
 * every time it runs — which matters because the nightly reset job runs this and
 * a recorded walkthrough has to still match afterwards.
 *
 * Stages are added slice by slice. Each one returns the ids the next one needs.
 */
export async function runSeed() {
  const { db, pool } = createSeedDb();
  const rng = new Rng(0xb817_4a2e);
  const startedAt = Date.now();

  try {
    console.log('Clearing existing data…');
    const cleared = await truncateAll(db);
    console.log(`  ${cleared.length} tables cleared`);

    console.log('Seeding branches, tiers, customers and users…');
    const org = await seedOrganisation(db);

    console.log('Seeding settings and document counters…');
    await db.insert(settings).values([
      { key: 'region', value: { code: process.env.REGION ?? 'US' } },
      {
        key: 'store',
        value: {
          name: 'Brightwater Trade Supplies',
          supportPhone: '(973) 555-0100',
          supportEmail: 'trade@brightwatertrade.example',
          freeDeliveryThresholdMinor: 25_000,
          deliveryChargeMinor: 1_850,
        },
      },
    ]);

    await db.insert(documentCounters).values([
      { key: 'order', prefix: 'BW-', nextValue: 1, padTo: 5 },
      { key: 'invoice', prefix: 'INV-', nextValue: 1, padTo: 5 },
      { key: 'credit_note', prefix: 'CRN-', nextValue: 1, padTo: 4 },
    ]);

    const buyerCount = org.companies.reduce(
      (total, company) => total + company.buyerIds.length,
      0,
    );
    const addressCount = org.companies.reduce(
      (total, company) => total + company.addressIds.length,
      0,
    );

    console.log('\nSeed complete in %dms', Date.now() - startedAt);
    console.table([
      { entity: 'Branches', count: Object.keys(org.branchIdByCode).length },
      { entity: 'Price tiers', count: Object.keys(org.tierIdByCode).length },
      { entity: 'Customer companies', count: org.companies.length },
      { entity: 'Customer buyers', count: buyerCount },
      { entity: 'Delivery addresses', count: addressCount },
      { entity: 'Brightwater staff', count: org.staffIds.length },
    ]);

    // Referenced once so the generator is wired in and ready for the catalogue
    // and order-history stages; remove when those land.
    void rng;

    return org;
  } finally {
    await pool.end();
  }
}

