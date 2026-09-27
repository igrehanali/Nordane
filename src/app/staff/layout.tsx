import type * as React from 'react';
import { AppShell } from '@/components/shell/app-shell';
import { requireStaff } from '@/lib/auth/session';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireStaff();

  return (
    <AppShell actor={actor} navKey="staff" badge="Back office">
      {children}
    </AppShell>
  );
}
