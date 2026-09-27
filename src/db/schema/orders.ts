import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  fulfilmentTypeEnum,
  orderStatusEnum,
  priceSourceEnum,
  taxCodeEnum,
  uomEnum,
} from './enums';
import { products } from './catalogue';
import { addresses, branches, customerCompanies } from './org';
import { promotions } from './pricing';
import { users } from './users';

/** One open cart per buyer. Lines hold no prices — everything is repriced on read. */
export const carts = pgTable(
  'carts',
  {
    id: uuid().primaryKey().defaultRandom(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('carts_user_key').on(table.userId)],
);

export const cartLines = pgTable(
  'cart_lines',
  {
    id: uuid().primaryKey().defaultRandom(),
    cartId: uuid()
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    qty: integer().notNull(),
    note: text(),
    addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('cart_lines_cart_product_key').on(table.cartId, table.productId)],
);

/**
 * A placed order.
 *
 * Totals and the delivery address are frozen at placement: repricing a product or
 * editing an address later must never rewrite history. `orderNumber` comes from
 * the `documentCounters` table inside the placing transaction.
 */
export const orders = pgTable(
  'orders',
  {
    id: uuid().primaryKey().defaultRandom(),
    orderNumber: text().notNull(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id),
    placedByUserId: uuid()
      .notNull()
      .references(() => users.id),
    /** Set when a member of Brightwater staff keyed the order in for the customer. */
    placedByStaffUserId: uuid().references(() => users.id),
    status: orderStatusEnum().notNull().default('new'),
    fulfilmentType: fulfilmentTypeEnum().notNull(),
    /** Branch fulfilling or holding for collection. */
    branchId: uuid()
      .notNull()
      .references(() => branches.id),
    deliveryAddressId: uuid().references(() => addresses.id),

    /** Frozen copy of the delivery address as it was at placement. */
    deliveryName: text(),
    deliveryLine1: text(),
    deliveryLine2: text(),
    deliveryCity: text(),
    deliveryState: text(),
    deliveryPostcode: text(),
    deliveryCountry: text(),
    deliveryInstructions: text(),

    customerPoNumber: text(),
    requestedDate: date(),
    customerNotes: text(),
    internalNotes: text(),

    currencyCode: text().notNull().default('USD'),
    taxLabel: text().notNull().default('Sales Tax'),
    taxRateBps: integer().notNull(),
    subtotalMinor: integer().notNull(),
    /** Total saved against list price. Shown to the buyer; it sells the portal. */
    savingsMinor: integer().notNull().default(0),
    deliveryChargeMinor: integer().notNull().default(0),
    taxMinor: integer().notNull(),
    totalMinor: integer().notNull(),

    placedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    pickingAt: timestamp({ withTimezone: true }),
    dispatchedAt: timestamp({ withTimezone: true }),
    collectedAt: timestamp({ withTimezone: true }),
    invoicedAt: timestamp({ withTimezone: true }),
    cancelledAt: timestamp({ withTimezone: true }),
    cancelReason: text(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('orders_number_key').on(table.orderNumber),
    index('orders_company_placed_idx').on(table.customerCompanyId, table.placedAt.desc()),
    index('orders_status_placed_idx').on(table.status, table.placedAt.desc()),
    index('orders_branch_idx').on(table.branchId),
  ],
);

export const orderLines = pgTable(
  'order_lines',
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    lineNo: smallint().notNull(),
    productId: uuid()
      .notNull()
      .references(() => products.id),
    /** Snapshots, so an order still reads correctly after a product is renamed. */
    sku: text().notNull(),
    name: text().notNull(),
    uom: uomEnum().notNull(),
    packQty: integer().notNull().default(1),
    qty: integer().notNull(),
    /** What this customer actually paid per unit, in minor units. */
    unitPriceMinor: integer().notNull(),
    /** List price at the time, for the "you saved" column. */
    listPriceMinor: integer().notNull(),
    lineTotalMinor: integer().notNull(),
    taxCode: taxCodeEnum().notNull(),
    priceSource: priceSourceEnum().notNull(),
    appliedPromotionId: uuid().references(() => promotions.id, { onDelete: 'set null' }),
    note: text(),
  },
  (table) => [
    index('order_lines_order_idx').on(table.orderId),
    index('order_lines_product_idx').on(table.productId),
    uniqueIndex('order_lines_order_line_key').on(table.orderId, table.lineNo),
  ],
);

/** Append-only audit trail, rendered as a timeline on the staff order screen. */
export const orderEvents = pgTable(
  'order_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: orderStatusEnum(),
    toStatus: orderStatusEnum(),
    /** Null for system-generated events such as the confirmation email. */
    userId: uuid().references(() => users.id, { onDelete: 'set null' }),
    message: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('order_events_order_idx').on(table.orderId, table.createdAt)],
);

/** "Bathroom refit kit", "van stock" — the lists a buyer reorders from. */
export const savedLists = pgTable(
  'saved_lists',
  {
    id: uuid().primaryKey().defaultRandom(),
    customerCompanyId: uuid()
      .notNull()
      .references(() => customerCompanies.id, { onDelete: 'cascade' }),
    createdByUserId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    /** Shared lists are visible to every buyer on the account. */
    isShared: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('saved_lists_company_idx').on(table.customerCompanyId)],
);

export const savedListLines = pgTable(
  'saved_list_lines',
  {
    id: uuid().primaryKey().defaultRandom(),
    savedListId: uuid()
      .notNull()
      .references(() => savedLists.id, { onDelete: 'cascade' }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    qty: integer().notNull().default(1),
    sortOrder: smallint().notNull().default(0),
  },
  (table) => [
    uniqueIndex('saved_list_lines_list_product_key').on(table.savedListId, table.productId),
  ],
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  company: one(customerCompanies, {
    fields: [carts.customerCompanyId],
    references: [customerCompanies.id],
  }),
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  lines: many(cartLines),
}));

export const cartLinesRelations = relations(cartLines, ({ one }) => ({
  cart: one(carts, { fields: [cartLines.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartLines.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  company: one(customerCompanies, {
    fields: [orders.customerCompanyId],
    references: [customerCompanies.id],
  }),
  placedBy: one(users, { fields: [orders.placedByUserId], references: [users.id] }),
  branch: one(branches, { fields: [orders.branchId], references: [branches.id] }),
  lines: many(orderLines),
  events: many(orderEvents),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, { fields: [orderLines.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderLines.productId], references: [products.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
  user: one(users, { fields: [orderEvents.userId], references: [users.id] }),
}));

export const savedListsRelations = relations(savedLists, ({ one, many }) => ({
  company: one(customerCompanies, {
    fields: [savedLists.customerCompanyId],
    references: [customerCompanies.id],
  }),
  lines: many(savedListLines),
}));

export const savedListLinesRelations = relations(savedListLines, ({ one }) => ({
  list: one(savedLists, { fields: [savedListLines.savedListId], references: [savedLists.id] }),
  product: one(products, { fields: [savedListLines.productId], references: [products.id] }),
}));
