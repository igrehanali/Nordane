import { relations, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  customType,
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
import { taxCodeEnum, uomEnum } from './enums';
import { branches } from './org';

/** Postgres full-text search vector. Drizzle has no native mapping for it. */
const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const categories = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull(),
    name: text().notNull(),
    description: text(),
    /** One level of nesting is plenty for a merchant catalogue. */
    parentId: uuid().references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
    sortOrder: smallint().notNull().default(0),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('categories_slug_key').on(table.slug),
    index('categories_parent_idx').on(table.parentId),
  ],
);

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey().defaultRandom(),
    sku: text().notNull(),
    slug: text().notNull(),
    name: text().notNull(),
    description: text(),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id),
    brand: text().notNull(),
    /** Manufacturer part number — trade buyers search on this as often as the SKU. */
    mpn: text(),
    barcode: text(),
    uom: uomEnum().notNull().default('each'),
    /** How many individual items are in one sellable unit (a box of 10 elbows). */
    packQty: integer().notNull().default(1),
    /** List price in minor units. The customer's price is derived, never stored here. */
    listPriceMinor: integer().notNull(),
    /** Staff-only. Never selected into a customer-facing query. */
    costPriceMinor: integer(),
    taxCode: taxCodeEnum().notNull().default('standard'),
    weightGrams: integer(),
    isActive: boolean().notNull().default(true),
    /** Not stocked: ordered in for the customer, with a lead time. */
    isSpecialOrder: boolean().notNull().default(false),
    leadTimeDays: smallint(),
    imageKey: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    /**
     * Generated full-text index over the fields a buyer actually types. Weighted
     * so a SKU or name match outranks a description match.
     */
    searchVector: tsvector()
      .notNull()
      .generatedAlwaysAs(
        sql`setweight(to_tsvector('english', coalesce(sku, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(mpn, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'C')`,
      ),
  },
  (table) => [
    uniqueIndex('products_sku_key').on(table.sku),
    uniqueIndex('products_slug_key').on(table.slug),
    index('products_category_active_idx').on(table.categoryId, table.isActive),
    index('products_search_idx').using('gin', table.searchVector),
    index('products_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`),
    index('products_sku_trgm_idx').using('gin', sql`${table.sku} gin_trgm_ops`),
  ],
);

/**
 * Spec attributes. Doubles as the facet source for catalogue filters, so the
 * filter sidebar is driven by data rather than hard-coded per category.
 */
export const productAttributes = pgTable(
  'product_attributes',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    key: text().notNull(),
    value: text().notNull(),
    isFilterable: boolean().notNull().default(false),
    sortOrder: smallint().notNull().default(0),
  },
  (table) => [
    index('product_attributes_product_idx').on(table.productId),
    index('product_attributes_facet_idx').on(table.key, table.value),
  ],
);

/** Stock per product per branch. `available` is on hand less allocated. */
export const stockLevels = pgTable(
  'stock_levels',
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    branchId: uuid()
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    qtyOnHand: integer().notNull().default(0),
    /** Committed to picked-but-not-dispatched orders. */
    qtyAllocated: integer().notNull().default(0),
    /** Below this, the product shows on the staff low-stock list. */
    reorderPoint: integer().notNull().default(0),
    binLocation: text(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.branchId] }),
    index('stock_levels_branch_idx').on(table.branchId),
  ],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent',
  }),
  children: many(categories, { relationName: 'category_parent' }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  attributes: many(productAttributes),
  stock: many(stockLevels),
}));

export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
}));

export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
  product: one(products, { fields: [stockLevels.productId], references: [products.id] }),
  branch: one(branches, { fields: [stockLevels.branchId], references: [branches.id] }),
}));
