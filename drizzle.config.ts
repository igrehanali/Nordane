import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env.local wins (Next's convention), .env is the fallback for CI.
loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — copy .env.example to .env.local and fill it in.');
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
