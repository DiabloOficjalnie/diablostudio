-- Patch for consultation_requests to support new panel fields
-- Run this in Supabase SQL editor (or psql) to add any missing columns safely.

alter table if exists public.consultation_requests
  add column if not exists inquiry_type text,
  add column if not exists service_type text,
  add column if not exists preferred_time text;

-- Optional: ensure status can include 'cancelled' (status is text in our usage)
-- If you previously used an enum, you may need to alter the enum to include 'cancelled'.
-- Example for enum (uncomment and adjust enum name if applicable):
-- alter type consultation_status add value if not exists 'cancelled';

-- Indexes to improve filtering (optional)
create index if not exists idx_consultation_requests_client_id on public.consultation_requests (client_id);
create index if not exists idx_consultation_requests_created_at on public.consultation_requests (created_at desc);
