import type { Metadata } from 'next';
import { Banknote, Building2, Phone, Users } from 'lucide-react';
import { PageHeader } from '@/components/shell/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { DetailRow, StatTile } from '@/components/ui/stat';
import { requireCustomer } from '@/lib/auth/session';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/auth/roles';
import { getAccountSummary } from '@/server/customer/account';
import { getFormatter } from '@/server/settings';

export const metadata: Metadata = { title: 'Overview' };

const STATUS_BADGE = {
  active: { variant: 'success', label: 'Account active' },
  on_hold: { variant: 'warning', label: 'Account on hold' },
  pending: { variant: 'info', label: 'Account pending' },
  closed: { variant: 'destructive', label: 'Account closed' },
} as const;

export default async function PortalOverviewPage() {
  const actor = await requireCustomer();
  const [account, fmt] = await Promise.all([getAccountSummary(actor.companyId), getFormatter()]);

  if (!account) {
    return (
      <Alert variant="destructive" title="Account not found">
        This login is not attached to a trade account. Please contact Brightwater.
      </Alert>
    );
  }

  const status = STATUS_BADGE[account.status];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${actor.name.split(' ')[0] ?? actor.name}`}
        description={`${account.name} · account ${account.accountNumber}`}
        actions={<Badge variant={status.variant}>{status.label}</Badge>}
      />

      {account.status === 'on_hold' ? (
        <Alert variant="warning" title="Ordering is paused on this account" className="mb-4">
          Your account is on hold. You can still view invoices and statements — please contact
          credit control on {account.branch.phone} to release ordering.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Credit limit"
          value={fmt.moneyShort(account.creditLimitMinor)}
          hint={account.paymentTermsLabel}
          icon={Banknote}
        />
        <StatTile
          label="Price tier"
          value={account.tierCode}
          hint={account.tierName}
          icon={Building2}
        />
        <StatTile
          label="Buyers on account"
          value={account.buyerCount}
          hint={`${account.addressCount} delivery address${account.addressCount === 1 ? '' : 'es'}`}
          icon={Users}
        />
        <StatTile
          label="Your branch"
          value={account.branch.city}
          hint={account.branch.name}
          icon={Phone}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="Account number">{account.accountNumber}</DetailRow>
              <DetailRow label="Trading as">{account.name}</DetailRow>
              <DetailRow label="Price tier">
                {account.tierCode} — {account.tierName}
              </DetailRow>
              <DetailRow label="Payment terms">{account.paymentTermsLabel}</DetailRow>
              <DetailRow label="Credit limit">{fmt.money(account.creditLimitMinor)}</DetailRow>
              <DetailRow label={`${fmt.region.taxLabel} status`}>
                {account.taxExempt ? 'Exempt — certificate on file' : 'Chargeable'}
              </DetailRow>
              <DetailRow label="Your access">{ROLE_LABELS[actor.role]}</DetailRow>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              {ROLE_DESCRIPTIONS[actor.role]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your branch</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="Branch">{account.branch.name}</DetailRow>
              <DetailRow label="Location">
                {account.branch.city}, {account.branch.state}
              </DetailRow>
              <DetailRow label="Phone">
                <a href={`tel:${account.branch.phone}`} className="text-primary hover:underline">
                  {account.branch.phone}
                </a>
              </DetailRow>
              {account.branch.openingHours ? (
                <DetailRow label="Opening hours">{account.branch.openingHours}</DetailRow>
              ) : null}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Collection orders are held at this branch. Stock at all four branches is shown on
              every product.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
