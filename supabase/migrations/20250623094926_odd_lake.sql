/*
  # Fix Supabase Backend Authentication Issues

  1. Database Changes
    - Fix transactions table constraint to include withdrawal type
    - Improve handle_new_user function with better error handling
    - Add necessary indexes for performance
    - Fix RLS policies for proper authentication flow
    - Ensure default investment plans exist

  2. Security
    - Add proper RLS policies for profile creation
    - Grant necessary permissions for authenticated users
    - Configure service role permissions for triggers
*/

-- Fix transactions table to include withdrawal type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_type_check' 
    AND table_name = 'transactions'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
  END IF;
END $$;

ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('deposit', 'investment', 'profit', 'reinvestment', 'withdrawal'));

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, btc_wallet, usdt_wallet)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'btc_wallet', ''),
    COALESCE(NEW.raw_user_meta_data->>'usdt_wallet', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_plan_id ON investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Anyone can read active investment plans" ON investment_plans;
DROP POLICY IF EXISTS "Admins can read all investment plans" ON investment_plans;

-- Create policy for profile creation during signup
CREATE POLICY "Enable insert for authentication users only"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow service role to insert profiles (for the trigger)
CREATE POLICY "Enable insert for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure investment plans are readable by authenticated users
CREATE POLICY "Anyone can read active investment plans"
  ON investment_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add policy for reading all investment plans for admins
CREATE POLICY "Admins can read all investment plans"
  ON investment_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Ensure the default investment plans exist (use DO block to handle conflicts)
DO $$
BEGIN
  -- Insert investment plans only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM investment_plans WHERE name = 'Starter') THEN
    INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) 
    VALUES ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM investment_plans WHERE name = 'Silver') THEN
    INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) 
    VALUES ('Silver', 1000, 4990, 10, 48, 'Enhanced returns for intermediate investors', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM investment_plans WHERE name = 'Gold') THEN
    INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) 
    VALUES ('Gold', 5000, 10000, 15, 72, 'Premium investment plan with excellent returns', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM investment_plans WHERE name = 'Platinum') THEN
    INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) 
    VALUES ('Platinum', 10000, 1000000, 20, 168, 'Exclusive plan for high-value investors', true);
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for the trigger
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;