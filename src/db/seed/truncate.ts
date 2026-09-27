import { sql } from 'drizzle-orm';
import type { SeedDb } from './connection';

/**
 * Empties every application table in one statement.
 *
 * The table list is read from the catalog rather than hard-coded, so adding a
 * table in a later slice cannot leave stale rows behind after a reset. Drizzle's
 * own migration bookkeeping is excluded — wiping that would make the database
 * think it had never been migrated.
 */
export async function truncateAll(db: SeedDb): Promise<string[]> {
  const result = await db.execute<{ table_name: string }>(sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
      and table_name not like '\\_\\_drizzle%'
    order by table_name
  `);

  const tables = result.rows.map((row) => row.table_name);
  if (tables.length === 0) return [];

  const identifiers = sql.join(
    tables.map((name) => sql.identifier(name)),
    sql`, `,
  );

  await db.execute(sql`truncate table ${identifiers} restart identity cascade`);
  return tables;
}
