/**
 * Roles and the actor model.
 *
 * Kept free of any database or Node-only import so it can be used from
 * middleware (edge runtime), server components and client components alike.
 */

export const ROLES = ['customer_admin', 'customer_buyer', 'staff_admin', 'staff'] as const;
export type Role = (typeof ROLES)[number];

export const CUSTOMER_ROLES = ['customer_admin', 'customer_buyer'] as const;
export const STAFF_ROLES = ['staff_admin', 'staff'] as const;

export type CustomerRole = (typeof CUSTOMER_ROLES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  customer_admin: 'Account admin',
  customer_buyer: 'Buyer',
  staff_admin: 'Manager',
  staff: 'Staff',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  customer_admin: 'Can order, view invoices and statements, and manage the other buyers',
  customer_buyer: 'Can order and see order history. No access to invoices or user management',
  staff_admin: 'Full back office: pricing, credit limits, customers, products and settings',
  staff: 'Day to day back office: orders, stock and customer lookup. No pricing or credit changes',
};

export function isCustomerRole(role: Role): role is CustomerRole {
  return role === 'customer_admin' || role === 'customer_buyer';
}

export function isStaffRole(role: Role): role is StaffRole {
  return role === 'staff_admin' || role === 'staff';
}

/** Where a user lands after signing in. */
export function homePathForRole(role: Role): string {
  return isStaffRole(role) ? '/staff' : '/portal';
}

/**
 * The authenticated user, as every server-side caller sees them.
 *
 * `companyId` is the tenancy key. It is non-null for customer roles and null for
 * staff, and the customer data access layer will not accept a query without one.
 */
export interface Actor {
  userId: string;
  email: string;
  name: string;
  role: Role;
  companyId: string | null;
  companyName: string | null;
  accountNumber: string | null;
  homeBranchId: string | null;
}

/** An actor narrowed to a trade customer, where `companyId` is guaranteed. */
export interface CustomerActor extends Actor {
  role: CustomerRole;
  companyId: string;
  companyName: string;
  accountNumber: string;
}

export interface StaffActor extends Actor {
  role: StaffRole;
  companyId: null;
}
