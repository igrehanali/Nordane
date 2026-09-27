import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Every state machine in the app is a real Postgres enum. A bad status can then
 * never reach the database, whatever a route handler forgets to validate.
 */

export const userRoleEnum = pgEnum('user_role', [
  'customer_admin',
  'customer_buyer',
  'staff_admin',
  'staff',
]);

export const companyStatusEnum = pgEnum('company_status', [
  'pending',
  'active',
  'on_hold',
  'closed',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'new',
  'picking',
  'dispatched',
  'collected',
  'invoiced',
  'cancelled',
]);

export const fulfilmentTypeEnum = pgEnum('fulfilment_type', ['delivery', 'collection']);

export const uomEnum = pgEnum('uom', [
  'each',
  'box',
  'case',
  'pair',
  'foot',
  'length',
  'roll',
  'bag',
]);

export const taxCodeEnum = pgEnum('tax_code', ['standard', 'zero', 'reduced']);

/** Where a shown price came from. Rendered to the buyer as a badge. */
export const priceSourceEnum = pgEnum('price_source', [
  'list',
  'tier',
  'contract',
  'quantity_break',
  'promotion',
]);

export const promotionTypeEnum = pgEnum('promotion_type', [
  'percent_off',
  'fixed_price',
  'amount_off',
]);

export const promotionScopeEnum = pgEnum('promotion_scope', ['product', 'category', 'all']);

export const invoiceTypeEnum = pgEnum('invoice_type', ['invoice', 'credit_note']);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'open',
  'part_paid',
  'paid',
  'void',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'ach',
  'check',
  'card',
  'cash',
  'credit_note',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'new',
  'reviewing',
  'approved',
  'rejected',
]);

export const quoteStatusEnum = pgEnum('quote_status', ['new', 'quoted', 'won', 'lost']);
