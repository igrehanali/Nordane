import 'server-only';
import { and, asc, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { branches, customerCompanies, priceTiers, users } from '@/db/schema';

/**
 * Back-office reads.
 *
 * Staff are not tenant-scoped — they see the whole business by design — so these
 * functions take no company id. They live in a separate module from the customer
 * queries precisely so that difference is visible in the import path.
 */

export interface StaffOverview {
  customerCount: number;
  activeCustomerCount: number;
  onHoldCount: number;
  buyerCount: number;
  branches: {
    id: string;
    code: string;
    name: string;
    city: string;
    state: string;
    phone: string;
    customerCount: number;
  }[];
  tiers: { code: string; name: string; customerCount: number }[];
}

export async function getStaffOverview(): Promise<StaffOverview> {
  const [companyTotals, buyerTotals, branchRows, tierRows] = await Promise.all([
    db
      .select({ status: customerCompanies.status, value: count() })
      .from(customerCompanies)
      .groupBy(customerCompanies.status),

    db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.role, 'customer_buyer'))),

    db
      .select({
        id: branches.id,
        code: branches.code,
        name: branches.name,
        city: branches.city,
        state: branches.state,
        phone: branches.phone,
        customerCount: count(customerCompanies.id),
      })
      .from(branches)
      .leftJoin(customerCompanies, eq(customerCompanies.primaryBranchId, branches.id))
      .groupBy(branches.id, branches.code, branches.name, branches.city, branches.state, branches.phone, branches.sortOrder)
      .orderBy(asc(branches.sortOrder)),

    db
      .select({
        code: priceTiers.code,
        name: priceTiers.name,
        customerCount: count(customerCompanies.id),
      })
      .from(priceTiers)
      .leftJoin(customerCompanies, eq(customerCompanies.priceTierId, priceTiers.id))
      .groupBy(priceTiers.code, priceTiers.name, priceTiers.sortOrder)
      .orderBy(asc(priceTiers.sortOrder)),
  ]);

  const byStatus = new Map(companyTotals.map((row) => [row.status, row.value]));

  return {
    customerCount: companyTotals.reduce((total, row) => total + row.value, 0),
    activeCustomerCount: byStatus.get('active') ?? 0,
    onHoldCount: byStatus.get('on_hold') ?? 0,
    buyerCount: buyerTotals[0]?.value ?? 0,
    branches: branchRows,
    tiers: tierRows,
  };
}
