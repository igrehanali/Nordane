import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { companyStatusEnum } from './enums';

/** Brightwater's own trade counters and warehouses. */
export const branches = pgTable(
  'branches',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    name: text().notNull(),
    line1: text().notNull(),
    line2: text(),
    city: text().notNull(),
    state: text().notNull(),
    postcode: text().notNull(),
    country: text().notNull().default('US'),
    phone: text().notNull(),
    email: text(),
    /** Tax rate applied to orders fulfilled from this branch. Falls back to region default. */
    taxRateBps: integer().notNull().default(700),
    openingHours: text(),
    isActive: boolean().notNull().default(true),
    sortOrder: smallint().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('branches_code_key').on(table.code)],
);

/**
 * The price tier a customer sits on. Tier 1 is the keenest; a customer-specific
 * price in `customerPrices` overrides whatever their tier says.
 */
export const priceTiers = pgTable(
  'price_tiers',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    name: text().notNull(),
    description: text(),
    /** Discount off list applied when a product has no explicit tier price. */
    defaultDiscountBps: integer().notNull().default(0),
    sortOrder: smallint().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('price_tiers_code_key').on(table.code)],
);

/**
 * A trade customer company. This is the tenant boundary: every customer-scoped
 * query in the application is filtered by a customerCompanyId, and the data
 * access layer has no way to express a query without one.
 */
export const customerCompanies = pgTable(
  'customer_companies',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Account number the customer quotes on the phone, e.g. BW-10042. */
    accountNumber: text().notNull(),
    name: text().notNull(),
    tradingName: text(),
    priceTierId: uuid()
      .notNull()
      .references(() => priceTiers.id),
    /** Their default collection branch and the one whose stock is shown first. */
    primaryBranchId: uuid()
      .notNull()
      .references(() => branches.id),
    status: companyStatusEnum().notNull().default('active'),
    /** Credit limit in minor units. Checked server-side at order placement. */
    creditLimitMinor: integer().notNull().default(0),
    creditTermsDays: smallint().notNull().default(30),
    paymentTermsLabel: text().notNull().default('Net 30 days'),
    /** Tax-exempt customers (resale certificate on file) are charged no tax. */
    taxExempt: boolean().notNull().default(false),
    taxExemptionRef: text(),
    taxId: text(),
    phone: text(),
    email: text(),
    website: text(),
    /** Internal notes, staff-visible only. */
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('customer_companies_account_number_key').on(table.accountNumber),
    index('customer_companies_status_idx').on(table.status),
    index('customer_companies_tier_idx').on(table.priceTierId),
  ],
);

/** Delivery and billing addresses. A company can hold many; orders snapshot them. */
export const addresses = pgTable(
  'addresses',
  {
    id: uuid().primaryKey().defaultRandom(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    contactName: text(),
    contactPhone: text(),
    line1: text().notNull(),
    line2: text(),
    city: text().notNull(),
    state: text().notNull(),
    postcode: text().notNull(),
    country: text().notNull().default('US'),
    /** Gate codes, "round the back", site access times — the stuff drivers need. */
    deliveryInstructions: text(),
    isDefaultDelivery: boolean().notNull().default(false),
    isBilling: boolean().notNull().default(false),
    archivedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('addresses_company_idx').on(table.customerCompanyId)],
);

export const branchesRelations = relations(branches, ({ many }) => ({
  companies: many(customerCompanies),
}));

export const priceTiersRelations = relations(priceTiers, ({ many }) => ({
  companies: many(customerCompanies),
}));

export const customerCompaniesRelations = relations(customerCompanies, ({ one, many }) => ({
  priceTier: one(priceTiers, {
    fields: [customerCompanies.priceTierId],
    references: [priceTiers.id],
  }),
  primaryBranch: one(branches, {
    fields: [customerCompanies.primaryBranchId],
    references: [branches.id],
  }),
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  company: one(customerCompanies, {
    fields: [addresses.customerCompanyId],
    references: [customerCompanies.id],
  }),
}));
