import Link from 'next/link';
import { Clock, PackageSearch, Receipt } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Placeholder public home page. Slice 7 replaces this with the full brand-led
 * public site (catalogue, trade account application, quote request).
 */
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label="Brightwater Trade Supplies home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/login">Trade log in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Plumbing &amp; heating wholesale
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your account, your prices, your branch stock — open 24 hours.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Brightwater trade customers order online at their agreed rates, see live stock across
            four branches, and put it all on their credit account. No phone queue, no PDF price
            list, no re-keying.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/login">Log in to order</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/apply">Open a trade account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: PackageSearch,
              title: 'Live branch stock',
              body: 'See what is on the shelf at Newark, Columbus, Dallas and Sacramento before you drive.',
            },
            {
              icon: Clock,
              title: 'Reorder in two clicks',
              body: 'Last month’s order, a saved list, or a pasted list of SKUs straight into the cart.',
            },
            {
              icon: Receipt,
              title: 'Invoices on demand',
              body: 'Download any invoice or statement yourself, without calling the office.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="space-y-2 py-4">
                <Icon className="size-5 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          Brightwater Trade Supplies is a fictional company. This is a concept build used to
          demonstrate B2B trade ordering software.
        </div>
      </footer>
    </div>
  );
}
