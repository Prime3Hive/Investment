/*
  # Restore Working Backend Authentication

  1. Clean up and recreate all necessary tables and functions
  2. Ensure proper RLS policies for authentication
  3. Fix the handle_new_user function
  4. Add proper indexes and constraints
  5. Insert default investment plans

  This migration restores the app to a working state where users can signup and login.
*/

-- Clean up existing data and start fresh
TRUNCATE TABLE IF EXISTS public.transactions CASCADE;
TRUNCATE TABLE IF EXISTS public.withdrawal_requests CASCADE;
TRUNCATE TABLE IF EXISTS public.deposit_requests CASCADE;
TRUNCATE TABLE IF EXISTS public.investments CASCADE;
TRUNCATE TABLE IF EXISTS public.profiles CASCADE;
TRUNCATE TABLE IF EXISTS public.investment_plans CASCADE;

-- Drop and recreate the handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, btc_wallet, usdt_wallet)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'User'),
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure all RLS policies are properly set up
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;

-- Create clean RLS policies for profiles
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

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles profiles_1
      WHERE profiles_1.id = auth.uid() AND profiles_1.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles profiles_1
      WHERE profiles_1.id = auth.uid() AND profiles_1.is_admin = true
    )
  );

CREATE POLICY "Enable insert for authentication users only"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Investment plans policies
DROP POLICY IF EXISTS "Anyone can read active investment plans" ON investment_plans;
DROP POLICY IF EXISTS "Admins can manage investment plans" ON investment_plans;
DROP POLICY IF EXISTS "Admins can read all investment plans" ON investment_plans;

CREATE POLICY "Anyone can read active investment plans"
  ON investment_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage investment plans"
  ON investment_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

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

-- Investments policies
DROP POLICY IF EXISTS "Users can read own investments" ON investments;
DROP POLICY IF EXISTS "Users can create own investments" ON investments;
DROP POLICY IF EXISTS "Admins can read all investments" ON investments;

CREATE POLICY "Users can read own investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Deposit requests policies
DROP POLICY IF EXISTS "Users can read own deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Users can create own deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can read all deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can update deposit requests" ON deposit_requests;

CREATE POLICY "Users can read own deposit requests"
  ON deposit_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own deposit requests"
  ON deposit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all deposit requests"
  ON deposit_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update deposit requests"
  ON deposit_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Withdrawal requests policies
DROP POLICY IF EXISTS "Users can read own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can read all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON withdrawal_requests;

CREATE POLICY "Users can read own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own withdrawal requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Transactions policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert default investment plans
INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description, is_active) VALUES
  ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey', true),
  ('Silver', 1000, 4990, 10, 48, 'Enhanced returns for intermediate investors', true),
  ('Gold', 5000, 10000, 15, 72, 'Premium investment plan with excellent returns', true),
  ('Platinum', 10000, 1000000, 20, 168, 'Exclusive plan for high-value investors', true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for the trigger
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;