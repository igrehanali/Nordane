import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

/**
 * Migration runner.
 *
 * Wraps drizzle-kit's migrator so the extensions the schema depends on exist
 * first: the catalogue's fuzzy search indexes are trigram indexes, and a
 * migration that creates one before `pg_trgm` exists fails.
 */
async function main() {
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
  const db = drizzle(pool);

  console.log('Ensuring required extensions…');
  await db.execute(sql`create extension if not exists pg_trgm`);

  console.log('Applying migrations…');
  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations up to date.');
  await pool.end();
}

main().catch((error: unknown) => {
  console.error('\nMigration failed:\n', error);
  process.exit(1);
});
