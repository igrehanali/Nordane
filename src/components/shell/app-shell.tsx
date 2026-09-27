import Link from 'next/link';
import type * as React from 'react';
import { MobileNav } from './mobile-nav';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';
import { Logo } from '@/components/brand/logo';
import type { Actor } from '@/lib/auth/roles';
import { navForRole, type NavKey } from '@/lib/nav';
import { cn } from '@/lib/utils';

/**
 * The frame both sides of the portal live in: fixed sidebar on desktop, slide-over
 * on mobile, and a sticky header with room for per-page actions.
 *
 * Content is capped at a wide measure rather than centred narrow — these are
 * working screens with dense tables, not marketing pages.
 */
export function AppShell({
  actor,
  navKey,
  badge,
  headerRight,
  children,
}: {
  actor: Actor;
  navKey: NavKey;
  /** Small label under the logo, e.g. the account number or "Back office". */
  badge?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const home = navForRole(navKey, actor.role)[0]?.href ?? '/';

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-3 py-3">
          <Link href={home} className="block rounded-md">
            <Logo />
          </Link>
          {badge ? (
            <p className="mt-2 truncate text-[11px] font-medium text-muted-foreground">{badge}</p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <SidebarNav navKey={navKey} role={actor.role} />
        </div>

        <div className="border-t border-border p-2">
          <UserMenu
            name={actor.name}
            email={actor.email}
            role={actor.role}
            companyName={actor.companyName}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <MobileNav navKey={navKey} role={actor.role} />
          <Link href={home} className="rounded-md lg:hidden">
            <Logo showWordmark={false} />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {headerRight}
            <div className="lg:hidden">
              <UserMenu
                name={actor.name}
                email={actor.email}
                role={actor.role}
                companyName={actor.companyName}
              />
            </div>
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Consistent page heading with optional description and right-hand actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
