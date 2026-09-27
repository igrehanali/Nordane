import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check } from 'lucide-react';
import { LoginForm } from './login-form';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { env } from '@/lib/env';
import { getActor } from '@/lib/auth/session';
import { homePathForRole } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the Brightwater trade ordering portal.',
};

const SELLING_POINTS = [
  'Your negotiated prices on every product, not list prices',
  'Live stock at all four branches before you drive over',
  'Reorder a past order or paste a list of SKUs in seconds',
  'Order on account, for delivery or collection',
  'Download your own invoices and statements',
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Already signed in: skip the form entirely.
  const actor = await getActor();
  if (actor) redirect(homePathForRole(actor.role));

  const { next } = await searchParams;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel. Hidden on phones, where it would just push the form down. */}
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" className="w-fit rounded-md" aria-label="Brightwater Trade Supplies home">
          <span className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
              <rect width="32" height="32" rx="7" fill="currentColor" fillOpacity="0.18" />
              <path
                d="M16 6.5c0 0-6.2 6.6-6.2 11.2A6.2 6.2 0 0 0 16 24a6.2 6.2 0 0 0 6.2-6.3C22.2 13.1 16 6.5 16 6.5Z"
                fill="currentColor"
              />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight">Brightwater</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] opacity-80">
                Trade Supplies
              </span>
            </span>
          </span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            The trade counter that never closes.
          </h1>
          <ul className="mt-6 space-y-2.5">
            {SELLING_POINTS.map((point) => (
              <li key={point} className="flex gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
                <span className="opacity-95">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-md text-xs opacity-75">
          Brightwater Trade Supplies is a fictional plumbing and heating wholesaler. This is a
          concept build demonstrating B2B trade ordering software.
        </p>
      </aside>

      <main id="main" className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="Brightwater Trade Supplies home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Trade customers and Brightwater staff sign in here.
            </p>

            <div className="mt-6">
              <LoginForm next={next} demoMode={env.DEMO_MODE} />
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              No account yet?{' '}
              <Link href="/apply" className="font-medium text-primary hover:underline">
                Apply for a trade account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
