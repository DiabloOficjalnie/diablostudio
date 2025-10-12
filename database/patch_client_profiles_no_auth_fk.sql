-- =============================================
-- Patch: Decouple client_profiles from auth.users (for Clerk-based auth)
-- Use this ONLY if you use Clerk (not Supabase Auth) and see FK issues.
-- This patch removes the foreign key to auth.users.
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'client_profiles'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Drop FK constraint to auth.users if present (constraint name may vary; try known name, else dynamic)
    BEGIN
      ALTER TABLE public.client_profiles DROP CONSTRAINT IF EXISTS client_profiles_id_fkey;
    EXCEPTION WHEN others THEN
      -- Fallback: find the exact constraint name dynamically and drop it
      EXECUTE (
        SELECT 'ALTER TABLE public.client_profiles DROP CONSTRAINT ' || quote_ident(tc.constraint_name)
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'client_profiles'
          AND tc.constraint_type = 'FOREIGN KEY'
        LIMIT 1
      );
    END;
  END IF;
END $$;

-- Ensure primary key remains on id (no type change to avoid policy dependency errors)
ALTER TABLE public.client_profiles
  ALTER COLUMN id SET NOT NULL;

-- (No FK to auth.users anymore)
-- Keep existing RLS policies; they check auth.uid() = id which still works
-- if you mirror Clerk users into JWT subject that matches your app-side ensureUUID(userId).

-- Sanity:
-- SELECT * FROM public.client_profiles LIMIT 1;
