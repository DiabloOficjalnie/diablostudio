-- Database Setup Verification Script for DiabloStudio
-- This script verifies that all required tables exist and have the correct structure

-- Function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = table_exists.table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if column exists in table
CREATE OR REPLACE FUNCTION column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = column_exists.table_name
    AND column_name = column_exists.column_name
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if index exists
CREATE OR REPLACE FUNCTION index_exists(index_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname = index_exists.index_name
  );
END;
$$ LANGUAGE plpgsql;

-- Verification results
DO $$
DECLARE
  verification_result TEXT := '';
  table_check BOOLEAN;
  column_check BOOLEAN;
  index_check BOOLEAN;
BEGIN
  RAISE NOTICE '=== DIABLOSTUDIO DATABASE VERIFICATION ===';
  RAISE NOTICE '';

  -- Check core tables
  RAISE NOTICE '1. CHECKING CORE TABLES:';

  -- customers table
  table_check := table_exists('customers');
  verification_result := verification_result || 'customers: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('customers', 'id') AND column_exists('customers', 'name') AND column_exists('customers', 'email');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- customer_quotes table
  table_check := table_exists('customer_quotes');
  verification_result := verification_result || 'customer_quotes: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('customer_quotes', 'id') AND column_exists('customer_quotes', 'customer_id') AND column_exists('customer_quotes', 'area');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- colors table
  table_check := table_exists('colors');
  verification_result := verification_result || 'colors: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('colors', 'id') AND column_exists('colors', 'code') AND column_exists('colors', 'name') AND column_exists('colors', 'hex');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- admin_users table
  table_check := table_exists('admin_users');
  verification_result := verification_result || 'admin_users: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('admin_users', 'id') AND column_exists('admin_users', 'email') AND column_exists('admin_users', 'is_active');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- reviews table
  table_check := table_exists('reviews');
  verification_result := verification_result || 'reviews: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('reviews', 'id') AND column_exists('reviews', 'first_name') AND column_exists('reviews', 'rating');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- realizations table
  table_check := table_exists('realizations');
  verification_result := verification_result || 'realizations: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('realizations', 'id') AND column_exists('realizations', 'title') AND column_exists('realizations', 'category');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '2. CHECKING CLIENT SYSTEM TABLES:';

  -- client_profiles table
  table_check := table_exists('client_profiles');
  verification_result := verification_result || 'client_profiles: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('client_profiles', 'id') AND column_exists('client_profiles', 'first_name') AND column_exists('client_profiles', 'email');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- client_quotes table
  table_check := table_exists('client_quotes');
  verification_result := verification_result || 'client_quotes: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('client_quotes', 'id') AND column_exists('client_quotes', 'client_id') AND column_exists('client_quotes', 'area');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- consultation_requests table
  table_check := table_exists('consultation_requests');
  verification_result := verification_result || 'consultation_requests: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('consultation_requests', 'id') AND column_exists('consultation_requests', 'client_id') AND column_exists('consultation_requests', 'preferred_date');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '3. CHECKING ADDITIONAL TABLES:';

  -- consultations table
  table_check := table_exists('consultations');
  verification_result := verification_result || 'consultations: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('consultations', 'id') AND column_exists('consultations', 'customer_name') AND column_exists('consultations', 'subject');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- faq table
  table_check := table_exists('faq');
  verification_result := verification_result || 'faq: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('faq', 'id') AND column_exists('faq', 'question') AND column_exists('faq', 'answer');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- valuation_requests table
  table_check := table_exists('valuation_requests');
  verification_result := verification_result || 'valuation_requests: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('valuation_requests', 'id') AND column_exists('valuation_requests', 'customer_name') AND column_exists('valuation_requests', 'project_type');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  -- content table
  table_check := table_exists('content');
  verification_result := verification_result || 'content: ' || CASE WHEN table_check THEN '✓' ELSE '✗' END || chr(10);
  IF table_check THEN
    column_check := column_exists('content', 'id') AND column_exists('content', 'content');
    verification_result := verification_result || '  - Required columns: ' || CASE WHEN column_check THEN '✓' ELSE '✗' END || chr(10);
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '4. CHECKING INDEXES:';

  -- Check key indexes
  index_check := index_exists('idx_colors_category');
  verification_result := verification_result || 'idx_colors_category: ' || CASE WHEN index_check THEN '✓' ELSE '✗' END || chr(10);

  index_check := index_exists('idx_colors_code');
  verification_result := verification_result || 'idx_colors_code: ' || CASE WHEN index_check THEN '✓' ELSE '✗' END || chr(10);

  index_check := index_exists('idx_client_quotes_client_id');
  verification_result := verification_result || 'idx_client_quotes_client_id: ' || CASE WHEN index_check THEN '✓' ELSE '✗' END || chr(10);

  RAISE NOTICE '';
  RAISE NOTICE '5. CHECKING SAMPLE DATA:';

  -- Check if colors were inserted
  IF table_exists('colors') THEN
    DECLARE color_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO color_count FROM colors;
      verification_result := verification_result || 'Colors count: ' || color_count || '/84 expected' || chr(10);
      IF color_count >= 84 THEN
        verification_result := verification_result || '  - Color palette: ✓' || chr(10);
      ELSE
        verification_result := verification_result || '  - Color palette: ⚠ (partial)' || chr(10);
      END IF;
    END;
  END IF;

  -- Check if FAQ entries exist
  IF table_exists('faq') THEN
    DECLARE faq_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO faq_count FROM faq;
      verification_result := verification_result || 'FAQ entries: ' || faq_count || chr(10);
    END;
  END IF;

  -- Check if reviews exist
  IF table_exists('reviews') THEN
    DECLARE review_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO review_count FROM reviews;
      verification_result := verification_result || 'Reviews: ' || review_count || chr(10);
    END;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION SUMMARY ===';
  RAISE NOTICE '%', verification_result;

  -- Overall assessment
  RAISE NOTICE '=== OVERALL ASSESSMENT ===';

  IF verification_result NOT LIKE '%✗%' THEN
    RAISE NOTICE '✅ ALL TABLES AND STRUCTURE VERIFIED SUCCESSFULLY!';
    RAISE NOTICE 'Database is ready for use.';
  ELSE
    RAISE NOTICE '❌ SOME ISSUES FOUND!';
    RAISE NOTICE 'Please check the schema file and run it again.';
  END IF;

END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(TEXT);
DROP FUNCTION IF EXISTS column_exists(TEXT, TEXT);
DROP FUNCTION IF EXISTS index_exists(TEXT);
