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
