import 'server-only';
import { z } from 'zod';
import { REGION_CODES } from './region';

/**
 * Server environment, validated once at first import. A missing or malformed
 * variable fails loudly at boot rather than as a confusing runtime error three
 * screens into the app.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1).startsWith('postgres'),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters'),
  AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  REGION: z.enum(REGION_CODES).default('US'),
  DEMO_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  CRON_SECRET: z.string().min(8).optional(),
  EMAIL_TRANSPORT: z.enum(['console', 'resend']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('orders@brightwatertrade.example'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.local and fill in the values.`,
    );
  }
  if (parsed.data.EMAIL_TRANSPORT === 'resend' && !parsed.data.RESEND_API_KEY) {
    throw new Error('EMAIL_TRANSPORT=resend requires RESEND_API_KEY to be set.');
  }
  return parsed.data;
}

export const env = load();
export type Env = typeof env;
