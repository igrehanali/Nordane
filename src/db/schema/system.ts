import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { applicationStatusEnum, quoteStatusEnum } from './enums';
import { users } from './users';

/**
 * Runtime settings. `region` holds the currency, tax label and formatting config
 * so a single row change re-badges the whole portal for a UK, US or AU audience
 * without a rebuild or a redeploy.
 */
export const settings = pgTable('settings', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedByUserId: uuid().references(() => users.id, { onDelete: 'set null' }),
});

/**
 * Sequential human-readable document numbers. Incremented with `UPDATE ...
 * RETURNING` inside the same transaction that writes the document, so two
 * simultaneous orders can never collide on a number.
 */
export const documentCounters = pgTable('document_counters', {
  key: text().primaryKey(),
  prefix: text().notNull(),
  nextValue: integer().notNull().default(1),
  padTo: integer().notNull().default(5),
});

/**
 * Fixed-window rate limiting for auth and public forms. Kept in Postgres rather
 * than Redis: one dependency instead of two, and the volumes here are trivial.
 */
export const rateLimitHits = pgTable(
  'rate_limit_hits',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Composite of action and subject, e.g. "login:ip:203.0.113.4". */
    key: text().notNull(),
    windowStart: timestamp({ withTimezone: true }).notNull(),
    count: integer().notNull().default(1),
  },
  (table) => [
    uniqueIndex('rate_limit_key_window_key').on(table.key, table.windowStart),
    index('rate_limit_window_idx').on(table.windowStart),
  ],
);

/** Public "apply for a trade account" submissions, worked by staff. */
export const tradeApplications = pgTable(
  'trade_applications',
  {
    id: uuid().primaryKey().defaultRandom(),
    companyName: text().notNull(),
    contactName: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    tradeType: text().notNull(),
    yearsTrading: integer(),
    estimatedMonthlySpendMinor: integer(),
    taxId: text(),
    line1: text(),
    city: text(),
    state: text(),
    postcode: text(),
    message: text(),
    status: applicationStatusEnum().notNull().default('new'),
    reviewedByUserId: uuid().references(() => users.id, { onDelete: 'set null' }),
    staffNotes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('trade_applications_status_idx').on(table.status, table.createdAt)],
);

/** Public "request a quote" submissions. Lines are free text, as received. */
export const quoteRequests = pgTable(
  'quote_requests',
  {
    id: uuid().primaryKey().defaultRandom(),
    companyName: text(),
    contactName: text().notNull(),
    email: text().notNull(),
    phone: text(),
    /** Whatever they pasted or typed: SKUs, descriptions, a takeoff list. */
    requirements: text().notNull(),
    parsedLines: jsonb(),
    requiredBy: text(),
    status: quoteStatusEnum().notNull().default('new'),
    staffNotes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('quote_requests_status_idx').on(table.status, table.createdAt)],
);
