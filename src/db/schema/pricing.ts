import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { promotionScopeEnum, promotionTypeEnum } from './enums';
import { categories, products } from './catalogue';
import { customerCompanies, priceTiers } from './org';

/**
 * Pricing.
 *
 * Four layers, resolved server-side for every (product, company, quantity, date)
 * and never sent up from the client:
 *
 *   1. list price on the product
 *   2. tier price — explicit row here, else the tier's default discount off list
 *   3. customer-specific price or discount, optionally fixed so it wins outright
 *   4. quantity breaks and live promotions
 *
 * The resolver returns the lowest applicable price together with its source, so
 * the buyer can see *why* they are paying what they are paying.
 */

/** Explicit price for a product on a tier. Sparse: most products fall back. */
export const productTierPrices = pgTable(
  'product_tier_prices',
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    priceTierId: uuid()
      .notNull()
      .references(() => priceTiers.id, { onDelete: 'cascade' }),
    priceMinor: integer().notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.priceTierId] })],
);

/**
 * A negotiated price for one customer. Either an absolute price or a discount off
 * list, on either a single product or a whole category.
 *
 * `isFixed` means this is a contract price that beats everything else, including
 * a promotion that happens to be lower — which is what a contract actually says.
 */
export const customerPrices = pgTable(
  'customer_prices',
  {
    id: uuid().primaryKey().defaultRandom(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id, { onDelete: 'cascade' }),
    productId: uuid().references(() => products.id, { onDelete: 'cascade' }),
    categoryId: uuid().references(() => categories.id, { onDelete: 'cascade' }),
    priceMinor: integer(),
    discountBps: integer(),
    isFixed: boolean().notNull().default(false),
    effectiveFrom: timestamp({ withTimezone: true }).notNull().defaultNow(),
    effectiveTo: timestamp({ withTimezone: true }),
    note: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('customer_prices_lookup_idx').on(table.customerCompanyId, table.productId),
    index('customer_prices_category_idx').on(table.customerCompanyId, table.categoryId),
    // Exactly one target, and exactly one way of expressing the price. Anything
    // else is ambiguous, and an ambiguous price is a dispute with a customer.
    check(
      'customer_prices_target_check',
      sql`(${table.productId} is not null)::int + (${table.categoryId} is not null)::int = 1`,
    ),
    check(
      'customer_prices_value_check',
      sql`(${table.priceMinor} is not null)::int + (${table.discountBps} is not null)::int = 1`,
    ),
  ],
);

/**
 * Buy more, pay less. A break can be global (tier and company null), tier-wide,
 * or negotiated for one company.
 */
export const quantityBreaks = pgTable(
  'quantity_breaks',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    priceTierId: uuid().references(() => priceTiers.id, { onDelete: 'cascade' }),
    customerCompanyId: uuid().references(() => customerCompanies.id, { onDelete: 'cascade' }),
    minQty: integer().notNull(),
    priceMinor: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('quantity_breaks_product_idx').on(table.productId, table.minQty)],
);

export const promotions = pgTable(
  'promotions',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    name: text().notNull(),
    blurb: text(),
    type: promotionTypeEnum().notNull(),
    scope: promotionScopeEnum().notNull(),
    productId: uuid().references(() => products.id, { onDelete: 'cascade' }),
    categoryId: uuid().references(() => categories.id, { onDelete: 'cascade' }),
    /** For percent_off. */
    valueBps: integer(),
    /** For fixed_price and amount_off. */
    valueMinor: integer(),
    /** Empty means every tier. */
    appliesToTierCodes: text().array(),
    maxQtyPerOrder: integer(),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    endsAt: timestamp({ withTimezone: true }).notNull(),
    isActive: boolean().notNull().default(true),
    priority: smallint().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('promotions_code_key').on(table.code),
    index('promotions_window_idx').on(table.isActive, table.startsAt, table.endsAt),
    index('promotions_product_idx').on(table.productId),
    index('promotions_category_idx').on(table.categoryId),
  ],
);

export const productTierPricesRelations = relations(productTierPrices, ({ one }) => ({
  product: one(products, {
    fields: [productTierPrices.productId],
    references: [products.id],
  }),
  tier: one(priceTiers, {
    fields: [productTierPrices.priceTierId],
    references: [priceTiers.id],
  }),
}));

export const customerPricesRelations = relations(customerPrices, ({ one }) => ({
  company: one(customerCompanies, {
    fields: [customerPrices.customerCompanyId],
    references: [customerCompanies.id],
  }),
  product: one(products, { fields: [customerPrices.productId], references: [products.id] }),
  category: one(categories, {
    fields: [customerPrices.categoryId],
    references: [categories.id],
  }),
}));

export const quantityBreaksRelations = relations(quantityBreaks, ({ one }) => ({
  product: one(products, { fields: [quantityBreaks.productId], references: [products.id] }),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  product: one(products, { fields: [promotions.productId], references: [products.id] }),
  category: one(categories, { fields: [promotions.categoryId], references: [categories.id] }),
}));
