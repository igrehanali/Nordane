'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOutAction } from '@/app/actions/sign-out';
import { ROLE_LABELS, type Role } from '@/lib/auth/roles';

export function UserMenu({
  name,
  email,
  role,
  companyName,
}: {
  name: string;
  email: string;
  role: Role;
  companyName: string | null;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-accent">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary"
        >
          {initials || '?'}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-xs font-medium">{name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="sr-only">Account menu</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-64 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            {companyName ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">{companyName}</p>
            ) : null}
            <p className="mt-1.5 text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={(event) => {
              event.preventDefault();
              setTheme(isDark ? 'light' : 'dark');
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent"
          >
            {isDark ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
            {isDark ? 'Light theme' : 'Dark theme'}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
