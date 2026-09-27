import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

/**
 * Route gate. Uses the edge-safe half of the Auth.js config — no database, no
 * bcrypt — and defers to `authConfig.callbacks.authorized` for the decision.
 *
 * This keeps the wrong role out of the wrong section. It is not the security
 * boundary: per-record tenancy is enforced again in every query.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Everything except Next internals, static assets and the auth endpoints
     * themselves. Written as an exclusion so a new protected route is protected
     * by default rather than by remembering to add it here.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?)$).*)',
  ],
};
