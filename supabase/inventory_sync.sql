-- Kiemke-Lau2 / Supabase Cloud Sync
-- Run this script once in Supabase SQL Editor.
-- The browser never receives the secret key. /api/sync uses the server-side key.

create table if not exists public.inventory_sync (
  id bigint primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.inventory_sync enable row level security;

-- The Vercel Serverless Function uses the server-side Supabase secret key,
-- so no public INSERT/UPDATE/SELECT policy is required.
-- Do NOT create permissive anon policies for this table.

insert into public.inventory_sync (id, data, updated_at)
values (1, '{}'::jsonb, now())
on conflict (id) do nothing;

create index if not exists inventory_sync_updated_at_idx
  on public.inventory_sync (updated_at desc);
