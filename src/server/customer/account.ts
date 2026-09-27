import 'server-only';
import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { addresses, branches, customerCompanies, priceTiers, users } from '@/db/schema';
import { asMoney, type Money } from '@/lib/money';

/**
 * Customer account reads.
 *
 * Every function here takes `companyId` as its first argument and filters on it.
 * That is the tenancy boundary: there is no exported query that can be called
 * without one, so a page cannot accidentally leak another company's data by
 * forgetting a `where` clause.
 */

export interface AccountSummary {
  companyId: string;
  name: string;
  accountNumber: string;
  status: 'pending' | 'active' | 'on_hold' | 'closed';
  tierCode: string;
  tierName: string;
  creditLimitMinor: Money;
  creditTermsDays: number;
  paymentTermsLabel: string;
  taxExempt: boolean;
  branch: {
    id: string;
    name: string;
    city: string;
    state: string;
    phone: string;
    openingHours: string | null;
  };
  buyerCount: number;
  addressCount: number;
}

export async function getAccountSummary(companyId: string): Promise<AccountSummary | null> {
  const [row] = await db
    .select({
      companyId: customerCompanies.id,
      name: customerCompanies.name,
      accountNumber: customerCompanies.accountNumber,
      status: customerCompanies.status,
      creditLimitMinor: customerCompanies.creditLimitMinor,
      creditTermsDays: customerCompanies.creditTermsDays,
      paymentTermsLabel: customerCompanies.paymentTermsLabel,
      taxExempt: customerCompanies.taxExempt,
      tierCode: priceTiers.code,
      tierName: priceTiers.name,
      branchId: branches.id,
      branchName: branches.name,
      branchCity: branches.city,
      branchState: branches.state,
      branchPhone: branches.phone,
      branchHours: branches.openingHours,
    })
    .from(customerCompanies)
    .innerJoin(priceTiers, eq(customerCompanies.priceTierId, priceTiers.id))
    .innerJoin(branches, eq(customerCompanies.primaryBranchId, branches.id))
    .where(eq(customerCompanies.id, companyId))
    .limit(1);

  if (!row) return null;

  const [buyers] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.customerCompanyId, companyId), eq(users.isActive, true)));

  const [addressRows] = await db
    .select({ value: count() })
    .from(addresses)
    .where(and(eq(addresses.customerCompanyId, companyId), isNull(addresses.archivedAt)));

  return {
    companyId: row.companyId,
    name: row.name,
    accountNumber: row.accountNumber,
    status: row.status,
    tierCode: row.tierCode,
    tierName: row.tierName,
    creditLimitMinor: asMoney(row.creditLimitMinor),
    creditTermsDays: row.creditTermsDays,
    paymentTermsLabel: row.paymentTermsLabel,
    taxExempt: row.taxExempt,
    branch: {
      id: row.branchId,
      name: row.branchName,
      city: row.branchCity,
      state: row.branchState,
      phone: row.branchPhone,
      openingHours: row.branchHours,
    },
    buyerCount: buyers?.value ?? 0,
    addressCount: addressRows?.value ?? 0,
  };
}

/** The other buyers on the account. Visible to the account admin only. */
export async function listCompanyBuyers(companyId: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      jobTitle: users.jobTitle,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.customerCompanyId, companyId))
    .orderBy(users.name);
}
