# Kiemke-Lau2 — Vercel + Supabase Fix

## Root cause of the Vercel 500

The deployment logs show:

`Cannot find native binding` → `@rolldown/binding-wasm32-wasi`

This is the Vite 8/Rolldown optional-native dependency issue occurring during the Vercel runtime/build environment. It is **not** an RLS error.

This project is pinned to Vite 6.4.1, which does not use Vite 8's Rolldown runtime path.

## Vercel Environment Variables

Set these in **Project → Settings → Environment Variables** for Production (and Preview if required):

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Do not prefix the secret key with `VITE_`.

Never put the secret key in browser code.

## Supabase SQL

Run:

`supabase/inventory_sync.sql`

The table uses RLS and intentionally has no public anon INSERT/UPDATE policy. The serverless function accesses it with the server-side secret key.

## Redeploy

1. Commit/push the updated project.
2. Trigger a new Vercel deployment.
3. Make sure the deployment uses the new `package.json` (Vite 6.4.1) and does not reuse an old Vite 8 lockfile.
4. Open `/` and then test `/api/sync`.

Expected GET response shape:

```json
{
  "success": true,
  "data": {},
  "updatedAt": "..."
}
```

If environment variables are missing, `/api/sync` now returns a JSON error instead of an opaque crash.
