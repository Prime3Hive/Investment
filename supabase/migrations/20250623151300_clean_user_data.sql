/*
  # Clean User Data
  
  This script removes all user data from both the auth and public schemas.
  It will:
  1. Delete all rows from the profiles table
  2. Delete all users from the auth.users table
  3. Reset sequences if needed
  
  WARNING: This will remove ALL users including admins. You will need to recreate them.
*/

-- Begin transaction for safety
BEGIN;

-- Disable RLS temporarily to allow deletion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Clean public.profiles table
TRUNCATE public.profiles CASCADE;

-- Clean related tables that might have foreign key references
TRUNCATE public.investments CASCADE;
TRUNCATE public.deposit_requests CASCADE;
TRUNCATE public.withdrawal_requests CASCADE;
TRUNCATE public.transactions CASCADE;

-- Clean auth.users table (requires superuser privileges)
-- If you don't have superuser privileges, you'll need to do this through the Supabase dashboard UI
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Commit the transaction
COMMIT;

-- Notify completion
DO $$
BEGIN
  RAISE NOTICE 'User data cleanup completed successfully.';
END $$;
