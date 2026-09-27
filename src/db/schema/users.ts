import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';
import { branches, customerCompanies } from './org';

/**
 * One table for both sides of the portal.
 *
 * - `customer_admin` / `customer_buyer` must have a `customerCompanyId`
 * - `staff_admin` / `staff` must not, and may be tied to a home branch
 *
 * That invariant is enforced by a check constraint in the migration rather than
 * by hope, because a staff user who accidentally carries a company id would see
 * the wrong data.
 */
export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    passwordHash: text().notNull(),
    name: text().notNull(),
    jobTitle: text(),
    phone: text(),
    role: userRoleEnum().notNull(),
    /** Set for customer users, null for Brightwater staff. The tenancy key. */
    customerCompanyId: uuid().references(() => customerCompanies.id, { onDelete: 'cascade' }),
    /** Staff only: which branch they work out of. */
    homeBranchId: uuid().references(() => branches.id),
    isActive: boolean().notNull().default(true),
    lastLoginAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_key').on(table.email),
    index('users_company_idx').on(table.customerCompanyId),
    index('users_role_idx').on(table.role),
    // Customer roles must carry a tenant; staff roles must not. A staff user with
    // a stray company id would silently see one customer's data as their own.
    check(
      'users_company_scope_check',
      sql`(${table.role} in ('customer_admin', 'customer_buyer')) = (${table.customerCompanyId} is not null)`,
    ),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  company: one(customerCompanies, {
    fields: [users.customerCompanyId],
    references: [customerCompanies.id],
  }),
  homeBranch: one(branches, {
    fields: [users.homeBranchId],
    references: [branches.id],
  }),
}));
