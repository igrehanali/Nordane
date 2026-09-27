import type { Metadata } from 'next';
import { Building2, PauseCircle, UserCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/shell/app-shell';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat';
import { Table, TableScroll, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { requireStaff } from '@/lib/auth/session';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/auth/roles';
import { getStaffOverview } from '@/server/staff/overview';
import { getFormatter } from '@/server/settings';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function StaffDashboardPage() {
  const actor = await requireStaff();
  const [overview, fmt] = await Promise.all([getStaffOverview(), getFormatter()]);

  return (
    <>
      <PageHeader
        title="Back office"
        description={`${ROLE_LABELS[actor.role]} — ${ROLE_DESCRIPTIONS[actor.role]}`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Trade accounts"
          value={fmt.number(overview.customerCount)}
          hint="Across all branches"
          icon={Building2}
        />
        <StatTile
          label="Active"
          value={fmt.number(overview.activeCustomerCount)}
          hint="Able to order"
          icon={UserCheck}
          tone="success"
        />
        <StatTile
          label="On hold"
          value={fmt.number(overview.onHoldCount)}
          hint="Ordering blocked"
          icon={PauseCircle}
          tone={overview.onHoldCount > 0 ? 'warning' : 'default'}
        />
        <StatTile
          label="Buyer logins"
          value={fmt.number(overview.buyerCount)}
          hint="Standard buyers, excludes account admins"
          icon={Users}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Branches</CardTitle>
          </CardHeader>
          <TableScroll className="rounded-none border-0">
            <Table>
              <THead>
                <TR>
                  <TH>Branch</TH>
                  <TH>Location</TH>
                  <TH>Phone</TH>
                  <TH numeric>Accounts</TH>
                </TR>
              </THead>
              <TBody>
                {overview.branches.map((branch) => (
                  <TR key={branch.id}>
                    <TD>
                      <span className="font-medium">{branch.name}</span>
                      <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                        {branch.code}
                      </span>
                    </TD>
                    <TD className="text-muted-foreground">
                      {branch.city}, {branch.state}
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">{branch.phone}</TD>
                    <TD numeric>{fmt.number(branch.customerCount)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableScroll>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Price tiers</CardTitle>
          </CardHeader>
          <TableScroll className="rounded-none border-0">
            <Table>
              <THead>
                <TR>
                  <TH>Tier</TH>
                  <TH>Name</TH>
                  <TH numeric>Accounts</TH>
                </TR>
              </THead>
              <TBody>
                {overview.tiers.map((tier) => (
                  <TR key={tier.code}>
                    <TD className="font-mono text-xs font-medium">{tier.code}</TD>
                    <TD>{tier.name}</TD>
                    <TD numeric>{fmt.number(tier.customerCount)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableScroll>
        </Card>
      </div>
    </>
  );
}
