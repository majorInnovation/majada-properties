# Majada Properties — setup

Real full‑stack app: Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage).
Buyers and sellers are separate accounts with their own portals and their own data
(enforced by Postgres Row Level Security).

## 1. Environment

`.env.local` in the project root (already present):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
```

Both come from Supabase Dashboard → **Project Settings → API**. No service‑role key is used.

## 2. Create the database

Supabase Dashboard → **SQL Editor → New query** → paste the whole of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.

That creates:

| Table | Purpose |
|---|---|
| `profiles` | one row per user, holds `role` = `buyer` \| `seller` |
| `properties` + `property_images` | seller listings and their photos |
| `saved_properties` | each buyer's shortlist |
| `conversations` + `messages` | buyer ↔ seller chat, per property |

It also adds RLS policies on every table, a trigger that creates a `profiles`
row automatically on sign‑up (reading `first_name` / `last_name` / `phone` /
`user_type` from the sign‑up form), and a public **`property-images`** Storage
bucket for uploads.

## 3. Auth configuration

Dashboard → **Authentication → URL Configuration**

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/**`

Dashboard → **Authentication → Providers → Email** (for local testing)

- Turn **Confirm email** off so you can sign in immediately after registering.
  Leave it on for production — users then click the link in their inbox, which
  routes through `/auth/callback`.

## 4. Run

```
npm install
npm run dev
```

Open http://localhost:3000.

## 5. Try the full flow

1. **Create account → "Seller"** with one email. You land on `/dashboard`.
2. **Add a property**, attach 5+ photos, **Publish**. Photos upload to Storage,
   the row is tied to your account.
3. Sign out. **Create account → "Buyer"** with a *different* email. You land on
   `/buyer` and see the published listing (drafts never show).
4. Open the listing → **Save** it (appears under Saved homes) and **Send a
   message to the seller**.
5. Sign back in as the seller → **Messages** shows the buyer's message; reply.

Each account only ever sees its own listings, saved homes, profile and
conversations — that is the database enforcing RLS, not the UI.

## How account separation works

- `proxy.ts` (runs before every request) checks the Supabase session and the
  user's `role`, then keeps sellers inside `/dashboard/**` and buyers inside
  `/buyer/**`. Signed‑out visitors to either area are sent to `/auth/login`.
- Every portal page calls `requireRole('buyer' | 'seller')` on the server.
- All reads/writes go through the Supabase clients in `lib/supabase/*`; mutations
  are server actions in `app/actions/*`. There is no mock data anywhere.
