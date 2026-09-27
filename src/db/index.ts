import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '@/lib/env';
import * as schema from './schema';

/**
 * Database client.
 *
 * One `pg` pool, reused across hot reloads in development and across warm
 * invocations in production. Pointed at Neon's pooled endpoint, so the pool here
 * stays small — Neon does the heavy connection multiplexing.
 */

declare global {
  var __brightwaterPool: Pool | undefined;
}

function createPool(): Pool {
  const needsSsl = /sslmode=require|neon\.tech/.test(env.DATABASE_URL);
  return new Pool({
    connectionString: env.DATABASE_URL,
    // Neon's pooler fans these out; a big local pool buys nothing and costs
    // connection slots on cold starts.
    max: env.NODE_ENV === 'production' ? 5 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
  });
}

const pool = globalThis.__brightwaterPool ?? createPool();
if (env.NODE_ENV !== 'production') {
  globalThis.__brightwaterPool = pool;
}

export const db = drizzle(pool, { schema, casing: 'snake_case' });
export { pool };
export type Database = typeof db;
export * as schema from './schema';
