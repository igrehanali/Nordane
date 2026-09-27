/**
 * Demo personas.
 *
 * The login page offers one-click sign-in as each of these so a prospect can look
 * around without being handed a password. The seed script creates exactly these
 * accounts, and the nightly reset job puts them back.
 *
 * The shared password is intentionally public: every account here belongs to a
 * fictional company in a throwaway demo database.
 */

export const DEMO_PASSWORD = 'demo1234';

export type DemoPersona = 'customer' | 'staff';

export interface DemoAccount {
  persona: DemoPersona;
  email: string;
  password: string;
  label: string;
  description: string;
  landingPath: string;
}

export const DEMO_ACCOUNTS: Record<DemoPersona, DemoAccount> = {
  customer: {
    persona: 'customer',
    email: 'dean@halvorsenplumbing.example',
    password: DEMO_PASSWORD,
    label: 'Explore as trade customer',
    description: 'Dean Halvorsen · Halvorsen Plumbing & Heating · account admin',
    landingPath: '/portal',
  },
  staff: {
    persona: 'staff',
    email: 'marcy.kwan@brightwatertrade.example',
    password: DEMO_PASSWORD,
    label: 'Explore as Brightwater staff',
    description: 'Marcy Kwan · operations manager · full back office',
    landingPath: '/staff',
  },
};

/** Every seeded login, listed on the login page and in DEMO.md. */
export const DEMO_DIRECTORY = [
  {
    email: 'dean@halvorsenplumbing.example',
    role: 'Customer — account admin',
    note: 'Tier 1 contract pricing, invoices and user management',
  },
  {
    email: 'ryan@halvorsenplumbing.example',
    role: 'Customer — buyer',
    note: 'Same company, ordering only: no invoices, no user management',
  },
  {
    email: 'marcy.kwan@brightwatertrade.example',
    role: 'Staff — manager',
    note: 'Pricing, credit limits, customers, settings',
  },
  {
    email: 'tom.iverson@brightwatertrade.example',
    role: 'Staff',
    note: 'Orders and stock only: cannot change pricing or credit',
  },
] as const;
