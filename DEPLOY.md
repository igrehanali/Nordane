# Deploying

Neon holds the data, Vercel runs the app, GitHub Actions gates the merges. Total
setup time from here is about ten minutes, most of it waiting for a build.

---

## 1. Environment variables

Generate the two secrets:

```bash
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64')); console.log('CRON_SECRET=' + require('crypto').randomBytes(16).toString('hex'))"
```

The full set the app needs:

| Variable | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string | The one with `-pooler` in the host |
| `AUTH_SECRET` | 32 random bytes, base64 | Signs the session token |
| `AUTH_URL` | `https://your-app.vercel.app` | Your production URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Same |
| `REGION` | `US` | Or `UK` / `AU`. Only the initial value — it is switchable in the back office |
| `DEMO_MODE` | `true` | Shows the two one-click demo buttons. Set `false` for a real deployment |
| `CRON_SECRET` | 16 random bytes, hex | Authenticates the nightly demo reset |
| `EMAIL_TRANSPORT` | `console` | Order confirmations go to the server log |

## 2. Vercel

1. <https://vercel.com/new> → import `igrehanali/Nordane`.
2. Framework preset is detected as Next.js. Leave the build settings alone.
3. Paste all eight variables above into **Environment Variables**, for
   Production, Preview and Development.
4. Deploy. The first build takes two to three minutes.
5. Once it is live, set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the real URL it
   gave you and redeploy — sign-in will redirect to the wrong host otherwise.

### A note on the database driver

The app talks to Neon over TCP with `pg`, against the pooled endpoint. That works
on Vercel's Node runtime and keeps local, CI and production on exactly one code
path. If cold starts ever become a problem, swapping to
`@neondatabase/serverless` is a change to one file: `src/db/index.ts`.

## 3. Migrate and seed production

Migrations are not run automatically on deploy — an automatic migration on every
push is how a bad deploy takes the database with it. Run them yourself against
the production database:

```bash
DATABASE_URL="<your neon url>" npm run db:migrate
DATABASE_URL="<your neon url>" npm run db:seed
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL="<your neon url>"; npm run db:migrate; npm run db:seed
```

## 4. Nightly demo reset

Lands in slice 8. `vercel.json` will declare a cron hitting
`/api/cron/reset-demo`, which checks `CRON_SECRET` before rebuilding the demo
dataset from scratch. Vercel's Hobby plan allows one cron job per day, which is
exactly what this needs.

## 5. CI

`.github/workflows/ci.yml` runs typecheck, lint, unit tests and a production
build on every push and pull request to `main`. It uses placeholder environment
variables and never touches a real database.

---

## Troubleshooting

**`Invalid environment configuration` at boot** — a variable is missing or
malformed. The error names each one.

**Sign-in redirects to `localhost`** — `AUTH_URL` still points at your machine.

**`relation "users" does not exist`** — migrations have not been run against this
database. See step 3.

**`password authentication failed`** — you used Neon's direct connection string
instead of the pooled one, or the project was reset and issued a new password.
