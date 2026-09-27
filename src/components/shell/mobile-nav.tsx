'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import type { Role } from '@/lib/auth/roles';
import type { NavKey } from '@/lib/nav';

/** Slide-over navigation for phones and tablets. */
export function MobileNav({
  navKey,
  role,
  footer,
}: {
  navKey: NavKey;
  role: Role;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="iconSm" className="lg:hidden">
          <Menu aria-hidden />
          <span className="sr-only">Open navigation</span>
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <Dialog.Title asChild>
              <span>
                <Logo />
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="iconSm">
                <X aria-hidden />
                <span className="sr-only">Close navigation</span>
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <SidebarNav navKey={navKey} role={role} onNavigate={() => setOpen(false)} />
          </div>

          {footer ? <div className="border-t border-border p-3">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
