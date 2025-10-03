-- Add yourself as an admin user
-- Replace YOUR_EMAIL@example.com with your actual email address

INSERT INTO admin_users (id, email, is_active) VALUES (
  auth.uid(),  -- This will be replaced with your actual user ID when you run it
  'YOUR_EMAIL@example.com',
  true
);

-- Alternative: If you want to add admin by email (run this in Supabase SQL Editor after signing up):
-- INSERT INTO admin_users (id, email, is_active)
-- SELECT id, email, true
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL@example.com';
