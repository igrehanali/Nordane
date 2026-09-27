import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { customerCompanies, users } from '@/db/schema';
import { authConfig } from './config';

/**
 * Full Auth.js setup. Node runtime only — it reaches the database and runs
 * bcrypt. Middleware uses `./config` instead.
 *
 * Credentials provider, chosen so the demo needs no email round trip or OAuth
 * app. For a real deployment this is the one piece that would be swapped for an
 * email link or SSO.
 */

const credentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

/**
 * A real bcrypt hash of a random string. Compared against when no user matches so
 * a wrong email and a wrong password take the same time to fail, and the login
 * form cannot be used to discover who holds an account.
 */
const DECOY_HASH = '$2b$10$4DZZzUdDY5j0NzQawB7aquPzyKoUWgcbAQX0VVl/hZMblitg1pBNC';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();

        const [record] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
            companyId: users.customerCompanyId,
            homeBranchId: users.homeBranchId,
            companyName: customerCompanies.name,
            accountNumber: customerCompanies.accountNumber,
            companyStatus: customerCompanies.status,
          })
          .from(users)
          .leftJoin(customerCompanies, eq(users.customerCompanyId, customerCompanies.id))
          .where(eq(users.email, email))
          .limit(1);

        const passwordMatches = await compare(
          parsed.data.password,
          record?.passwordHash ?? DECOY_HASH,
        );

        if (!record || !passwordMatches) return null;
        if (!record.isActive) return null;
        // A closed account is gone. An account on hold can still sign in — they
        // need to reach their invoices to settle up; ordering is blocked later.
        if (record.companyStatus === 'closed') return null;

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, record.id));

        return {
          id: record.id,
          email: record.email,
          name: record.name,
          role: record.role,
          companyId: record.companyId,
          companyName: record.companyName,
          accountNumber: record.accountNumber,
          homeBranchId: record.homeBranchId,
        };
      },
    }),
  ],
});
