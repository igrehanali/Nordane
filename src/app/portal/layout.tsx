import type * as React from 'react';
import { AppShell } from '@/components/shell/app-shell';
import { requireCustomer } from '@/lib/auth/session';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // Every page under /portal is behind this. The returned actor carries the
  // tenancy key that the data layer requires.
  const actor = await requireCustomer();

  return (
    <AppShell actor={actor} navKey="portal" badge={`${actor.companyName} · ${actor.accountNumber}`}>
      {children}
    </AppShell>
  );
}
