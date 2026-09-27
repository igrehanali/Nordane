'use server';

import { headers } from 'next/headers';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { DEMO_ACCOUNTS, type DemoPersona } from '@/lib/auth/demo';
import { clientIpFrom, consumeRateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(320),
  password: z.string().min(1, 'Enter your password').max(200),
  next: z.string().optional(),
});

/**
 * Only same-origin relative paths are honoured, so a crafted `?next=` cannot turn
 * the login page into an open redirect.
 */
function safeRedirect(next: string | undefined): string | undefined {
  if (!next) return undefined;
  if (!next.startsWith('/') || next.startsWith('//')) return undefined;
  return next;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Check the details and try again',
      email: String(formData.get('email') ?? ''),
    };
  }

  const { email, password, next } = parsed.data;
  const ip = clientIpFrom(await headers());

  // Two limits: one stops a single machine spraying many accounts, the other
  // stops many machines converging on one account.
  const byIp = await consumeRateLimit({ key: `login:ip:${ip}`, limit: 20, windowSeconds: 600 });
  const byEmail = await consumeRateLimit({
    key: `login:email:${email}`,
    limit: 8,
    windowSeconds: 600,
  });

  if (!byIp.ok || !byEmail.ok) {
    const wait = Math.ceil(Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds) / 60);
    return {
      error: `Too many sign-in attempts. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`,
      email,
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: safeRedirect(next) ?? '/',
    });
  } catch (error) {
    // A successful sign-in throws NEXT_REDIRECT, which must be allowed through.
    if (error instanceof AuthError) {
      return { error: 'Those details do not match an account.', email };
    }
    throw error;
  }

  return {};
}

/**
 * One-click sign-in to a seeded account, for the demo. Guarded by DEMO_MODE so a
 * real deployment cannot be walked into.
 */
export async function demoLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!env.DEMO_MODE) return { error: 'Demo sign-in is disabled on this deployment.' };

  const persona = formData.get('persona');
  if (persona !== 'customer' && persona !== 'staff') {
    return { error: 'Unknown demo account.' };
  }

  const account = DEMO_ACCOUNTS[persona satisfies DemoPersona];

  try {
    await signIn('credentials', {
      email: account.email,
      password: account.password,
      redirectTo: account.landingPath,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'The demo data has not been seeded yet. Run `npm run db:seed`.' };
    }
    throw error;
  }

  return {};
}
