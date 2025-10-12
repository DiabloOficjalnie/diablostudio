-- =============================================
-- Client Panel - Minimal Core Schema Bootstrap (fixed for Postgres: no IF NOT EXISTS in CREATE POLICY/CREATE TRIGGER)
-- Creates ONLY the base tables required to fix FK errors when saving quotes:
--   - client_profiles
--   - client_quotes
--   - consultation_requests
-- Plus RLS, policies, indexes, and updated_at triggers.
-- Run this in Supabase SQL Editor (recommended) or psql connected to your Supabase database.
-- =============================================

-- 0) Helper function for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1) Base table: client_profiles (ID = auth.users.id by default)
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Base table: client_quotes (FK -> client_profiles)
CREATE TABLE IF NOT EXISTS public.client_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  area DECIMAL(10,2) NOT NULL,
  floor_system VARCHAR(50) NOT NULL,
  substrate_condition VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  decorative_system VARCHAR(50) NOT NULL,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  total_min DECIMAL(10,2),
  total_max DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'saved' CHECK (status IN ('saved', 'consultation_requested', 'in_progress', 'completed')),
  contact_preferences JSONB,
  consents JSONB,
  consultation_date TIMESTAMP WITH TIME ZONE,
  consultation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Base table: consultation_requests (FK -> client_profiles, client_quotes)
CREATE TABLE IF NOT EXISTS public.consultation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.client_quotes(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(10) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Enable RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies (CREATE POLICY ... IF NOT EXISTS is not supported → use DO blocks with checks)

-- client_profiles: owner policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_profiles' AND policyname='Client profiles are viewable by owner') THEN
    CREATE POLICY "Client profiles are viewable by owner" ON public.client_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_profiles' AND policyname='Client profiles are insertable by owner') THEN
    CREATE POLICY "Client profiles are insertable by owner" ON public.client_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_profiles' AND policyname='Client profiles are updatable by owner') THEN
    CREATE POLICY "Client profiles are updatable by owner" ON public.client_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- client_quotes: owner policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_quotes' AND policyname='Client quotes are viewable by owner') THEN
    CREATE POLICY "Client quotes are viewable by owner" ON public.client_quotes
      FOR SELECT USING (auth.uid() = client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_quotes' AND policyname='Client quotes are insertable by owner') THEN
    CREATE POLICY "Client quotes are insertable by owner" ON public.client_quotes
      FOR INSERT WITH CHECK (auth.uid() = client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_quotes' AND policyname='Client quotes are updatable by owner') THEN
    CREATE POLICY "Client quotes are updatable by owner" ON public.client_quotes
      FOR UPDATE USING (auth.uid() = client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_quotes' AND policyname='Client quotes are deletable by owner') THEN
    CREATE POLICY "Client quotes are deletable by owner" ON public.client_quotes
      FOR DELETE USING (auth.uid() = client_id);
  END IF;
END $$;

-- consultation_requests: owner policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultation_requests' AND policyname='Consultation requests are viewable by owner') THEN
    CREATE POLICY "Consultation requests are viewable by owner" ON public.consultation_requests
      FOR SELECT USING (auth.uid() = client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultation_requests' AND policyname='Consultation requests are insertable by owner') THEN
    CREATE POLICY "Consultation requests are insertable by owner" ON public.consultation_requests
      FOR INSERT WITH CHECK (auth.uid() = client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultation_requests' AND policyname='Consultation requests are updatable by owner') THEN
    CREATE POLICY "Consultation requests are updatable by owner" ON public.consultation_requests
      FOR UPDATE USING (auth.uid() = client_id);
  END IF;
END $$;

-- Admin management policy (requires admin_users table with active admins)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultation_requests' AND policyname='Consultation requests are manageable by admins') THEN
      CREATE POLICY "Consultation requests are manageable by admins" ON public.consultation_requests
        FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true));
    END IF;
  END IF;
END $$;

-- 6) Indexes
CREATE INDEX IF NOT EXISTS idx_client_quotes_client_id ON public.client_quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_quotes_status ON public.client_quotes(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_client_id ON public.consultation_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_date ON public.consultation_requests(preferred_date);

-- 7) Triggers for updated_at (CREATE TRIGGER has no IF NOT EXISTS → use DO with pg_trigger checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_client_profiles_updated_at') THEN
    CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_client_quotes_updated_at') THEN
    CREATE TRIGGER update_client_quotes_updated_at BEFORE UPDATE ON public.client_quotes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_consultation_requests_updated_at') THEN
    CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON public.consultation_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 8) Quick sanity check (optional)
-- SELECT to_regclass('public.client_profiles') AS client_profiles,
--        to_regclass('public.client_quotes') AS client_quotes,
--        to_regclass('public.consultation_requests') AS consultation_requests;
