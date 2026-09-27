import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from './index';
import {
  type Actor,
  type CustomerActor,
  type StaffActor,
  homePathForRole,
  isCustomerRole,
  isStaffRole,
} from './roles';

/**
 * Server-side access to the current user.
 *
 * Every page, server action and route handler starts with one of these. The
 * narrowed return types are the point: `requireCustomer()` hands back an actor
 * whose `companyId` is a `string`, and the customer data access layer only
 * accepts a `string`, so there is no path to an unscoped query that typechecks.
 */

export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;

  return {
    userId: user.id,
    email: user.email ?? '',
    name: user.name ?? '',
    role: user.role,
    companyId: user.companyId,
    companyName: user.companyName,
    accountNumber: user.accountNumber,
    homeBranchId: user.homeBranchId,
  };
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  return actor;
}

/** A signed-in trade customer. Guarantees a tenancy key. */
export async function requireCustomer(): Promise<CustomerActor> {
  const actor = await requireActor();
  if (!isCustomerRole(actor.role) || !actor.companyId) {
    redirect(homePathForRole(actor.role));
  }
  return actor as CustomerActor;
}

/** A customer's account admin — the only customer role allowed near invoices and users. */
export async function requireCustomerAdmin(): Promise<CustomerActor> {
  const actor = await requireCustomer();
  if (actor.role !== 'customer_admin') redirect('/portal');
  return actor;
}

export async function requireStaff(): Promise<StaffActor> {
  const actor = await requireActor();
  if (!isStaffRole(actor.role)) redirect(homePathForRole(actor.role));
  return actor as StaffActor;
}

/** Pricing, credit limits and settings are manager-only. */
export async function requireStaffAdmin(): Promise<StaffActor> {
  const actor = await requireStaff();
  if (actor.role !== 'staff_admin') redirect('/staff');
  return actor;
}
