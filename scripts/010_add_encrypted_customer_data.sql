-- Script to make a user an admin
-- Replace 'your-email@example.com' with the actual email address

-- Example: Make a specific user admin
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@reknur.com';

-- To use this script:
-- 1. Uncomment the line above
-- 2. Replace 'admin@reknur.com' with your actual email
-- 3. Run this script

-- Check current admin users
SELECT id, email, name, is_admin, created_at 
FROM users 
WHERE is_admin = TRUE;
