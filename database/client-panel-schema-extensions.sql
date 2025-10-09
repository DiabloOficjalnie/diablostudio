-- Client Panel Schema Extensions
-- Safe to run multiple times. Creates missing tables and basic indexes.
-- Run in Supabase SQL editor or psql against your project.

-- Extensions (uncomment if needed)
-- create extension if not exists "uuid-ossp";
-- create extension if not exists pgcrypto;

-- 1) Client Documents
create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  title text not null,
  url text not null,
  type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_documents_client_id on public.client_documents (client_id);
create index if not exists idx_client_documents_created_at on public.client_documents (created_at desc);

-- 2) Client Photos
create table if not exists public.client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  title text,
  url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_photos_client_id on public.client_photos (client_id);
create index if not exists idx_client_photos_created_at on public.client_photos (created_at desc);

-- 3) Client Affiliate
create table if not exists public.client_affiliate (
  client_id text primary key,
  referral_code text unique,
  referrals_count integer not null default 0,
  discount_percentage integer not null default 0,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_affiliate_referral_code on public.client_affiliate (referral_code);

-- Optional: enforce FK to client_profiles if it exists
-- alter table public.client_affiliate
--   add constraint client_affiliate_client_fk
--   foreign key (client_id) references public.client_profiles (id) on delete cascade;

-- 4) (Optional) RLS policies - if you plan to access directly from client-side Supabase (we currently use service role via Next API)
-- Note: If you enable RLS, add policies to allow only owners to read their rows.
-- alter table public.client_documents enable row level security;
-- create policy "read_own_documents" on public.client_documents
--   for select using (auth.uid() = client_id);
--
-- alter table public.client_photos enable row level security;
-- create policy "read_own_photos" on public.client_photos
--   for select using (auth.uid() = client_id);
--
-- alter table public.client_affiliate enable row level security;
-- create policy "read_own_affiliate" on public.client_affiliate
--   for select using (auth.uid() = client_id);

-- If you import data from admin side (service role) no extra policies required for inserts/updates done by server.
