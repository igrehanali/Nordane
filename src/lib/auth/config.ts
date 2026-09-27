import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import { homePathForRole, isStaffRole, type Role } from './roles';

/**
 * Edge-safe half of the Auth.js configuration.
 *
 * Middleware runs on the edge runtime, where `pg` and `bcryptjs` cannot go. This
 * file holds everything middleware needs — session strategy, callbacks and route
 * authorisation — and the providers are added in `./index.ts`, which only ever
 * runs in Node.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    // A trade counter is a shared desk; an eight hour shift is the right window.
    maxAge: 60 * 60 * 8,
  },
  trustHost: true,
  callbacks: {
    /** Copy the identity onto the token once, at sign-in. */
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.accountNumber = user.accountNumber;
        token.homeBranchId = user.homeBranchId;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.sub ?? '';
      session.user.role = token.role;
      session.user.companyId = token.companyId;
      session.user.companyName = token.companyName;
      session.user.accountNumber = token.accountNumber;
      session.user.homeBranchId = token.homeBranchId;
      return session;
    },

    /**
     * Route-level gate. Deliberately coarse — it keeps the wrong role out of the
     * wrong section of the app. Per-record tenancy is enforced again in the data
     * access layer, because a URL check is not a security boundary on its own.
     */
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      const role = auth?.user?.role as Role | undefined;

      const isPortal = pathname.startsWith('/portal');
      const isStaffArea = pathname.startsWith('/staff');
      if (!isPortal && !isStaffArea) return true;

      if (!role) {
        const loginUrl = new URL('/login', request.nextUrl.origin);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      const staff = isStaffRole(role);
      if ((isStaffArea && !staff) || (isPortal && staff)) {
        // Signed in, but on the wrong side of the house. Send them to their own.
        return NextResponse.redirect(new URL(homePathForRole(role), request.nextUrl.origin));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
