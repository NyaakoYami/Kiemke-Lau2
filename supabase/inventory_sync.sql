-- Kiemke-Lau2 / Supabase schema
-- Run this once in Supabase SQL Editor.

create table if not exists public.inventory_sync (
  id bigint primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Keep RLS enabled. The application writes through /api/sync using the
-- server-only Supabase secret key, so no public INSERT/UPDATE policy is needed.
alter table public.inventory_sync enable row level security;

-- Seed the single application row if it does not exist yet.
insert into public.inventory_sync (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

comment on table public.inventory_sync is
  'Single JSON document used by Kiemke-Lau2 cloud synchronization.';
