# Supabase Sync Fix

## Why the error happened

The browser was writing directly to `inventory_sync` with the publishable key. Because Row Level Security (RLS) is enabled and there is no matching INSERT/UPDATE policy, Supabase rejects the request with:

`new row violates row-level security policy for table "inventory_sync"`

The application now sends GET/POST requests to `/api/sync`. The serverless function uses the Supabase secret key server-side, so the secret key is never bundled into the browser.

## Required Vercel Environment Variables

Add these variables in Vercel Project Settings → Environment Variables:

- `SUPABASE_URL` = your project URL
- `SUPABASE_SECRET_KEY` = your Supabase secret key

Do NOT put `SUPABASE_SECRET_KEY` in React/Vite source code or any `VITE_*` variable.

## Table

The table must exist:

```sql
create table if not exists public.inventory_sync (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz default now(),
  updated_by text
);
```

RLS can remain enabled because the server function uses the secret key.

## Important security action

If a real Supabase secret key was exposed publicly, rotate it in Supabase and use the newly generated secret key in Vercel. The old secret must not be kept in source code, screenshots, chat messages, or client-side bundles.


## Admin authorization

Cloud writes (`POST /api/sync`) now require the `X-Admin-Email` header and the
server validates it against the exact four-email whitelist shared by the frontend
and API. Domain-only checks such as `endsWith("@vietmyssu.com")` are not used.

The current application does not contain an external identity provider/login
flow. The email modal is therefore an authorization gate, not proof of identity.
For production-grade identity verification, connect the UI to Supabase Auth
(Google/OTP/password) and validate the resulting JWT on the server before
applying the same four-email whitelist.
