# natascha-summers Project Memory

## Stack
- Next.js 16 (App Router, TypeScript)
- Shadcn UI + Tailwind CSS v4 (dark theme)
- Prisma v7 with @prisma/adapter-pg (requires pg adapter, no url in schema.prisma)
- PostgreSQL (via Vercel Postgres or self-hosted)
- Stripe (GBP, £1/vote, Checkout Sessions)
- bcryptjs + jsonwebtoken (custom auth, no NextAuth)
- nodemailer (email verification/reset)
- Zod v4 (validation – uses .issues[0].message, not .errors)
- TMDB API (movie/show poster lookup)

## Key Notes
- Prisma v7: no `url` in schema.prisma datasource; configured via prisma.config.ts
- Prisma v7: must use driver adapter (PrismaPg) in PrismaClient constructor
- Zod v4: `error.issues[0]` not `error.errors[0]`
- Stripe API version: `2026-02-25.clover`
- db.ts uses lazy Proxy to avoid build-time instantiation errors
- Auth: JWT in httpOnly cookie named `auth_token`, 7d expiry
- Admin: first user with ADMIN_EMAIL env gets role='admin' on signup

## File Locations
- `/src/lib/db.ts` – Prisma lazy singleton with PrismaPg adapter
- `/src/lib/auth.ts` – hashPassword, verifyPassword, generateJWT, verifyJWT, getAuthUser, setAuthCookie
- `/src/lib/email.ts` – nodemailer for verification/reset emails
- `/src/lib/tmdb.ts` – TMDB search for movie/show posters
- `/src/lib/validations.ts` – all Zod schemas
- `/src/contexts/AuthContext.tsx` – React auth context (user, refresh, logout)
- `/src/components/Navbar.tsx` – top nav with auth state

## API Routes
- POST /api/auth/signup – create account, send verification email
- POST /api/auth/login – login, set auth cookie
- GET  /api/auth/verify – verify email token
- POST /api/auth/reset-password – request reset email
- PATCH /api/auth/reset-password – apply new password
- POST /api/auth/logout – clear cookie
- GET  /api/auth/me – return current user
- POST /api/suggest – suggest content (auth required)
- POST /api/approve – admin approve/deny suggestion
- POST /api/vote – create Stripe checkout session (auth required)
- POST /api/stripe-webhook – record vote after payment
- GET  /api/leaderboard?type=movie|show|other – sorted leaderboard
- GET  /api/search-content?q=&type= – search approved content
- GET/POST/DELETE /api/recent – recent content (admin POST/DELETE)
- GET  /api/admin/suggestions – all suggestions (admin only)

## Seed Scripts
- `npm run db:seed` — clears any existing seed data, then re-seeds (idempotent)
- `npm run db:seed:clear` — removes all seed data only
- Seed file: `prisma/seed.ts` (uses tsx + dotenv to load .env.local)
- Seed markers: email `@seed.nataschasummers.com`, paymentId prefix `seed_pay_`,
  youtubeLink contains `seed_natsummers`
- Seeds: 3 regular users + 2 admins, 5 movies + 7 shows + 10 other (all approved),
  ~50 votes, 5 recent content items
- Seed password (all users): `SeedUser123!`

## Setup Steps (for deployment)
1. Fill in `.env.local` with real values (copy from `.env.example`)
2. Run `npx prisma db push` to create tables
3. Sign up with ADMIN_EMAIL to get admin role automatically
4. Configure Stripe webhook endpoint: `/api/stripe-webhook`
5. Deploy to Vercel, set env vars in dashboard
6. Optionally run `npm run db:seed` to populate dev data
