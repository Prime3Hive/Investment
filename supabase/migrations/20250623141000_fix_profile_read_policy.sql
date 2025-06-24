/*
  # Fix Profile Read Permission Issue

  This migration adds a critical Row-Level Security (RLS) policy that was missing:
  - Allows authenticated users to read their own profile data
  - Fixes the "Error fetching profile" issue during sign-in
  
  The script is made idempotent to handle cases where policies might already exist.
*/

-- Check if the policy for users to read their own profile exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read their own profile'
  ) THEN
    -- Add policy to allow users to read their own profile
    EXECUTE 'CREATE POLICY "Users can read their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id)';
  END IF;

  -- No need to create the admin policy as it already exists
END $$;
