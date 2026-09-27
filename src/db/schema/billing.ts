import { relations } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { invoiceStatusEnum, invoiceTypeEnum, paymentMethodEnum } from './enums';
import { customerCompanies } from './org';
import { orders } from './orders';
import { users } from './users';

/**
 * Invoices and payments.
 *
 * Together these are the customer's ledger: a statement is this table plus
 * `payments` over a date range, aged into current / 30 / 60 / 90 buckets. Credit
 * exposure — checked against the credit limit before an order is accepted — is
 * the outstanding balance here plus the value of orders not yet invoiced.
 *
 * PDFs are rendered on demand from these rows and never stored.
 */
export const invoices = pgTable(
  'invoices',
  {
    id: uuid().primaryKey().defaultRandom(),
    invoiceNumber: text().notNull(),
    type: invoiceTypeEnum().notNull().default('invoice'),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id),
    /** Null for a standalone credit note. */
    orderId: uuid().references(() => orders.id, { onDelete: 'set null' }),
    status: invoiceStatusEnum().notNull().default('open'),
    issuedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    dueAt: date().notNull(),
    currencyCode: text().notNull().default('USD'),
    taxLabel: text().notNull().default('Sales Tax'),
    taxRateBps: integer().notNull(),
    subtotalMinor: integer().notNull(),
    taxMinor: integer().notNull(),
    totalMinor: integer().notNull(),
    /** Denormalised from `payments` so aging queries stay a single scan. */
    paidMinor: integer().notNull().default(0),
    customerPoNumber: text(),
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('invoices_number_key').on(table.invoiceNumber),
    index('invoices_company_status_idx').on(table.customerCompanyId, table.status),
    index('invoices_due_idx').on(table.dueAt),
    index('invoices_order_idx').on(table.orderId),
  ],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid().primaryKey().defaultRandom(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id, { onDelete: 'cascade' }),
    /** Null for a payment on account not yet allocated to an invoice. */
    invoiceId: uuid().references(() => invoices.id, { onDelete: 'set null' }),
    amountMinor: integer().notNull(),
    method: paymentMethodEnum().notNull(),
    reference: text(),
    receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    recordedByUserId: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('payments_company_received_idx').on(table.customerCompanyId, table.receivedAt),
    index('payments_invoice_idx').on(table.invoiceId),
  ],
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(customerCompanies, {
    fields: [invoices.customerCompanyId],
    references: [customerCompanies.id],
  }),
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(customerCompanies, {
    fields: [payments.customerCompanyId],
    references: [customerCompanies.id],
  }),
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));
