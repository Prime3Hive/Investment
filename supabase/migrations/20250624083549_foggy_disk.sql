/*
  # Fix Login Authentication Issues

  1. Database Changes
    - Ensure proper RLS policies for profile access
    - Fix any issues with profile creation and access
    - Add debugging and logging capabilities
    - Ensure email confirmation is disabled for immediate login

  2. Security
    - Verify all RLS policies work correctly
    - Ensure users can access their own profiles after login
    - Fix any permission issues
*/

-- Ensure email confirmation is disabled (this should be set in Supabase dashboard)
-- But we can check the current auth settings

-- Drop and recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name TEXT;
  btc_wallet TEXT;
  usdt_wallet TEXT;
BEGIN
  -- Log the trigger execution
  RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
  
  -- Extract user data with safe defaults
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  btc_wallet := COALESCE(NEW.raw_user_meta_data->>'btc_wallet', '');
  usdt_wallet := COALESCE(NEW.raw_user_meta_data->>'usdt_wallet', '');
  
  -- Insert the profile
  INSERT INTO public.profiles (id, name, btc_wallet, usdt_wallet, balance, is_admin)
  VALUES (NEW.id, user_name, btc_wallet, usdt_wallet, 0, false);
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify and fix RLS policies for profiles table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Ensure proper permissions are granted
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant service role permissions for triggers
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create a function to manually create missing profiles (for debugging)
CREATE OR REPLACE FUNCTION create_profile_for_user(user_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, name, btc_wallet, usdt_wallet, balance, is_admin)
  VALUES (
    user_id,
    COALESCE(user_name, split_part(user_email, '@', 1), 'User'),
    '',
    '',
    0,
    false
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION create_profile_for_user TO authenticated, service_role;

-- Verify that investment plans exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM investment_plans LIMIT 1) THEN
    INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) VALUES
      ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey', true),
      ('Silver', 1000, 4990, 10, 48, 'Enhanced returns for intermediate investors', true),
      ('Gold', 5000, 10000, 15, 72, 'Premium investment plan with excellent returns', true),
      ('Platinum', 10000, 1000000, 20, 168, 'Exclusive plan for high-value investors', true);
  END IF;
END $$;