import { hashSync } from 'bcryptjs';
import { DEMO_PASSWORD } from '../../lib/auth/demo';
import { addresses, branches, customerCompanies, priceTiers, users } from '../schema';
import type { SeedDb } from './connection';
import { BRANCH_SEED, PRICE_TIER_SEED, type BranchCode, type TierCode } from './data/branches';
import { COMPANY_SEED, STAFF_SEED, type CompanySeed } from './data/companies';

/**
 * Seeds branches, price tiers, customer companies, their buyers and addresses,
 * and Brightwater's own staff.
 *
 * Returns the generated ids so later stages (catalogue, pricing, order history)
 * can reference them without another round trip.
 */

export interface SeededCompany {
  id: string;
  seed: CompanySeed;
  tierId: string;
  branchId: string;
  buyerIds: { id: string; email: string; role: string }[];
  addressIds: { id: string; label: string; isDefaultDelivery: boolean }[];
}

export interface SeededOrg {
  branchIdByCode: Record<BranchCode, string>;
  tierIdByCode: Record<TierCode, string>;
  companies: SeededCompany[];
  staffIds: { id: string; email: string; role: string }[];
}

export async function seedOrganisation(db: SeedDb): Promise<SeededOrg> {
  // Every demo account shares one password, so hash it once rather than 30 times.
  const passwordHash = hashSync(DEMO_PASSWORD, 10);

  const branchRows = await db
    .insert(branches)
    .values(BRANCH_SEED.map((branch) => ({ ...branch, country: 'US' })))
    .returning({ id: branches.id, code: branches.code });

  const branchIdByCode = Object.fromEntries(
    branchRows.map((row) => [row.code, row.id]),
  ) as Record<BranchCode, string>;

  const tierRows = await db
    .insert(priceTiers)
    .values(PRICE_TIER_SEED.map((tier) => ({ ...tier })))
    .returning({ id: priceTiers.id, code: priceTiers.code });

  const tierIdByCode = Object.fromEntries(tierRows.map((row) => [row.code, row.id])) as Record<
    TierCode,
    string
  >;

  const companyRows = await db
    .insert(customerCompanies)
    .values(
      COMPANY_SEED.map((company) => ({
        accountNumber: company.accountNumber,
        name: company.name,
        tradingName: company.tradingName ?? null,
        priceTierId: tierIdByCode[company.tierCode],
        primaryBranchId: branchIdByCode[company.branchCode],
        status: company.status,
        creditLimitMinor: company.creditLimitMinor,
        creditTermsDays: company.creditTermsDays,
        paymentTermsLabel: company.paymentTermsLabel,
        taxExempt: company.taxExempt,
        taxExemptionRef: company.taxExemptionRef ?? null,
        taxId: company.taxId ?? null,
        phone: company.phone,
        email: company.email,
        notes: company.notes ?? null,
      })),
    )
    .returning({ id: customerCompanies.id, accountNumber: customerCompanies.accountNumber });

  const companyIdByAccount = new Map(companyRows.map((row) => [row.accountNumber, row.id]));

  // Buyers and addresses go in as two bulk inserts rather than per company: 12
  // round trips to Neon is 12 times the latency for no benefit.
  const buyerRows = await db
    .insert(users)
    .values(
      COMPANY_SEED.flatMap((company) =>
        company.buyers.map((buyer) => ({
          email: buyer.email,
          passwordHash,
          name: buyer.name,
          jobTitle: buyer.jobTitle,
          phone: buyer.phone ?? company.phone,
          role: buyer.role,
          customerCompanyId: companyIdByAccount.get(company.accountNumber) as string,
          homeBranchId: null,
        })),
      ),
    )
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      companyId: users.customerCompanyId,
    });

  const addressRows = await db
    .insert(addresses)
    .values(
      COMPANY_SEED.flatMap((company) =>
        company.addresses.map((address) => ({
          customerCompanyId: companyIdByAccount.get(company.accountNumber) as string,
          label: address.label,
          contactName: address.contactName ?? null,
          contactPhone: company.phone,
          line1: address.line1,
          line2: address.line2 ?? null,
          city: address.city,
          state: address.state,
          postcode: address.postcode,
          country: 'US',
          deliveryInstructions: address.deliveryInstructions ?? null,
          isDefaultDelivery: address.isDefaultDelivery ?? false,
          isBilling: address.isBilling ?? false,
        })),
      ),
    )
    .returning({
      id: addresses.id,
      label: addresses.label,
      companyId: addresses.customerCompanyId,
      isDefaultDelivery: addresses.isDefaultDelivery,
    });

  const staffRows = await db
    .insert(users)
    .values(
      STAFF_SEED.map((member) => ({
        email: member.email,
        passwordHash,
        name: member.name,
        jobTitle: member.jobTitle,
        role: member.role,
        customerCompanyId: null,
        homeBranchId: branchIdByCode[member.branchCode],
      })),
    )
    .returning({ id: users.id, email: users.email, role: users.role });

  const companies: SeededCompany[] = COMPANY_SEED.map((seed) => {
    const id = companyIdByAccount.get(seed.accountNumber) as string;
    return {
      id,
      seed,
      tierId: tierIdByCode[seed.tierCode],
      branchId: branchIdByCode[seed.branchCode],
      buyerIds: buyerRows
        .filter((row) => row.companyId === id)
        .map((row) => ({ id: row.id, email: row.email, role: row.role })),
      addressIds: addressRows
        .filter((row) => row.companyId === id)
        .map((row) => ({
          id: row.id,
          label: row.label,
          isDefaultDelivery: row.isDefaultDelivery,
        })),
    };
  });

  return { branchIdByCode, tierIdByCode, companies, staffIds: staffRows };
}
