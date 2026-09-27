# Brightwater Trade Supplies — trade ordering portal

**A working concept build of the B2B ordering software a plumbing and heating
distributor would run.** Brightwater is a fictional company. Everything in here
is real, working software; the company it serves is invented.

> 🚧 In progress. Slices ship one at a time — see [DECISIONS.md](DECISIONS.md)
> for the running log and [DEMO.md](DEMO.md) for the walkthrough once it exists.

---

## What it does

Distributors take orders by phone, by email, and off a PDF price list, and then
somebody in the office keys every one of them into the accounts system by hand.
This portal is the alternative: the customer places the order themselves, at the
price they have already been agreed, against stock they can actually see.

**For the trade customer** — a plumbing firm with a credit account:

- Log in and see **their own negotiated prices**, not list prices
- Live stock at their nearest branch, and at the other three
- Reorder last month's order in two clicks, or paste a list of SKUs from a job sheet
- Order on their credit account, for delivery or branch collection, with their own PO number
- Download their own invoices and statements without calling the office
- Several buyers per company, with an admin buyer who can see invoices and manage the others

**For the distributor's own staff:**

- Every incoming order on one board, with a status workflow from new to invoiced
- Customers, price tiers, customer-specific prices, credit limits and payment terms
- Products, categories and stock per branch
- A dashboard: today's orders, order value, top customers, what's running low

**For a visitor who is not a customer yet** — a public catalogue with list prices,
a trade account application, and a quote request form.

## Screenshots

_Added once the catalogue and back office are in (slice 2 and slice 6)._

## Try it

_Live URL and the two one-click demo logins land in slice 8._

---

## Technical

| | |
| --- | --- |
| Framework | Next.js 15, App Router, React 19, TypeScript in strict mode |
| Database | Postgres (Neon) with Drizzle ORM and generated SQL migrations |
| Auth | Auth.js v5, credentials provider, JWT sessions, four roles |
| UI | Tailwind v4 with semantic design tokens, Radix primitives, light and dark |
| Validation | Zod at every boundary — forms, server actions, route handlers, env |
| Money | Integer minor units end to end, branded type, no floats anywhere |
| Tests | Vitest for the pricing and money engines, Playwright for the core flows |
| CI | GitHub Actions: typecheck, lint, unit tests, build |

### Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

You need a Postgres database. A free [Neon](https://neon.tech) project takes two
minutes; copy the **pooled** connection string into `DATABASE_URL`.

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Load the demo dataset |
| `npm run db:reset` | Wipe and reseed (what the nightly demo reset runs) |
| `npm run db:studio` | Drizzle Studio, to browse the data |

### Deploying

Vercel, with `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`,
`REGION`, `DEMO_MODE` and `CRON_SECRET` set as environment variables. Full steps
are in [DEPLOY.md](DEPLOY.md) once slice 1 is deployed.

### Project layout

```
src/
  app/            routes — (public), (portal) for customers, (staff) for back office
  components/     ui/ primitives, then feature components
  db/             schema, migrations, seed
  lib/            money, region, env, pricing engine, auth helpers
```
