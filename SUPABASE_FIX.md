# Supabase Integration & RLS Fix

## Architecture

The browser does **not** write directly to `inventory_sync`.

```text
React UI
   ↓
/api/sync
   ↓
Supabase server client (secret key)
   ↓
public.inventory_sync
```

This keeps the Supabase secret key out of the browser bundle and avoids the
`new row violates row-level security policy` error.

## 1. Create the table

Run `supabase/inventory_sync.sql` in the Supabase SQL Editor.

RLS remains enabled. Do **not** add an anonymous INSERT/UPDATE policy just to
make the error disappear; that would expose the inventory write endpoint to
public clients.

## 2. Configure environment variables

### Vercel / production

Add:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Use a newly rotated secret key if the old key was exposed.

### Local development

Copy `.env.example` to `.env` and fill in the same two server-only values.

The frontend does not require `VITE_SUPABASE_SECRET_KEY` and must never receive
that value.

## 3. Run

```bash
npm install
npm run dev
```

The Vite development server now exposes `/api/sync` through the same handler
used in production.

For a production-style local test:

```bash
npm start
```

## 4. Verify

Open the application and check the status indicator.

- Green: connected/synced.
- Blue: connected but local changes have not been saved.
- Yellow: saving.
- Red: API/Supabase error.

Click **Lưu Cloud**, refresh the page, and confirm the saved state is loaded.

## Important security note

If a real `sb_secret_...` key has previously been shared, rotate/revoke it in
Supabase and update the new value in Vercel/local `.env`. Never commit `.env`
or place a secret key in a `VITE_*` variable.
