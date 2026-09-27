'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/auth/roles';
import { groupNav, navForRole, type NavKey } from '@/lib/nav';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string): boolean {
  if (href === '/portal' || href === '/staff') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  navKey,
  role,
  onNavigate,
  className,
}: {
  navKey: NavKey;
  role: Role;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const items = navForRole(navKey, role);

  return (
    <nav aria-label="Main" className={cn('space-y-4', className)}>
      {groupNav(items).map((group, index) => (
        <div key={group.section ?? `group-${index}`} className="space-y-0.5">
          {group.section ? (
            <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.section}
            </p>
          ) : null}

          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            const ready = item.available !== false;

            // Not built yet: render as text, so the shell is complete and
            // navigable without a link into a 404.
            if (!ready) {
              return (
                <span
                  key={item.href}
                  aria-disabled
                  title="Not in this build yet"
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground/50"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary dark:bg-primary/15'
                    : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
