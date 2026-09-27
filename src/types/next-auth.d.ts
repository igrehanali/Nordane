import type { Role } from '@/lib/auth/roles';

/**
 * Session, user and token carry the tenancy key, so a server component can scope
 * a query without a database round trip on every request.
 *
 * These augment `@auth/core` rather than `next-auth`: next-auth v5 re-exports
 * these interfaces from `@auth/core` instead of declaring its own, and a
 * `declare module 'next-auth'` block would create unrelated interfaces that the
 * callback signatures never see.
 *
 * The fields are written out in each block rather than extended from a shared
 * interface, because an augmenting interface that adds no members of its own is
 * indistinguishable from its supertype and reads as a mistake.
 */

declare module '@auth/core/types' {
  interface User {
    role: Role;
    /** Tenancy key. Non-null for customer roles, null for Brightwater staff. */
    companyId: string | null;
    companyName: string | null;
    accountNumber: string | null;
    homeBranchId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      companyId: string | null;
      companyName: string | null;
      accountNumber: string | null;
      homeBranchId: string | null;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: Role;
    companyId: string | null;
    companyName: string | null;
    accountNumber: string | null;
    homeBranchId: string | null;
  }
}
