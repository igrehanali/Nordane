import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

/**
 * Connection for the seed and reset scripts.
 *
 * Deliberately separate from `src/db/index.ts`: these run as plain Node scripts,
 * not inside Next, and a single connection is the right shape for a long batch of
 * inserts.
 */
export function createSeedDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — copy .env.example to .env.local.');
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: /sslmode=require|neon\.tech/.test(connectionString)
      ? { rejectUnauthorized: true }
      : undefined,
  });

  return { pool, db: drizzle(pool, { schema, casing: 'snake_case' }) };
}

export type SeedDb = ReturnType<typeof createSeedDb>['db'];
