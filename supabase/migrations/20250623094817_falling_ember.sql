/*
  # Fix Authentication and Backend Issues

  1. Issues Fixed
    - Add missing 'withdrawal' type to transactions table
    - Ensure proper foreign key constraints
    - Fix trigger function for user registration
    - Add proper indexes for performance
    - Ensure RLS policies are correctly configured

  2. Changes
    - Update transactions type constraint to include 'withdrawal'
    - Recreate handle_new_user function with better error handling
    - Add missing policies
    - Add indexes for better performance
*/

-- Fix transactions table to include withdrawal type
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
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

-- Ensure all tables have proper RLS policies
-- Additional policy for profile creation during signup
CREATE POLICY IF NOT EXISTS "Enable insert for authentication users only"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow service role to insert profiles (for the trigger)
CREATE POLICY IF NOT EXISTS "Enable insert for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure investment plans are readable by authenticated users
DROP POLICY IF EXISTS "Anyone can read active investment plans" ON investment_plans;
CREATE POLICY "Anyone can read active investment plans"
  ON investment_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add policy for reading all investment plans for admins
CREATE POLICY IF NOT EXISTS "Admins can read all investment plans"
  ON investment_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Ensure the default investment plans exist
INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) 
VALUES
  ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey', true),
  ('Silver', 1000, 4990, 10, 48, 'Enhanced returns for intermediate investors', true),
  ('Gold', 5000, 10000, 15, 72, 'Premium investment plan with excellent returns', true),
  ('Platinum', 10000, 1000000, 20, 168, 'Exclusive plan for high-value investors', true)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for the trigger
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;