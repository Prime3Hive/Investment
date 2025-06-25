/*
  # Complete Investment Platform Database Schema

  1. New Tables
    - `profiles` - User profile information with wallet addresses and balance
    - `investment_plans` - Available investment plans with ROI and duration
    - `investments` - User investments tracking
    - `deposit_requests` - Manual deposit confirmation requests
    - `withdrawal_requests` - Withdrawal requests for admin processing
    - `transactions` - All financial transactions history

  2. Security
    - Enable RLS on all tables
    - User-specific policies for data access
    - Service role policies for admin operations
    - Proper constraints for data integrity

  3. Functions & Triggers
    - Auto-create profile on user registration
    - Auto-update timestamps on record changes
    - Data validation constraints

  4. Default Data
    - 4 investment plans (Starter, Silver, Gold, Platinum)
    - Performance indexes for common queries
*/

-- Create profiles table (matches existing schema)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  btc_wallet text DEFAULT '',
  usdt_wallet text DEFAULT '',
  balance numeric(15,2) DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investment_plans table (matches existing schema)
CREATE TABLE IF NOT EXISTS investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_amount numeric(15,2) NOT NULL,
  max_amount numeric(15,2) NOT NULL,
  roi numeric(5,2) NOT NULL,
  duration_hours integer NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investments table (matches existing schema)
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES investment_plans(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  roi numeric(5,2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deposit_requests table (matches existing schema)
CREATE TABLE IF NOT EXISTS deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('BTC', 'USDT')),
  wallet_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create withdrawal_requests table (matches existing schema)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('BTC', 'USDT')),
  wallet_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table (matches existing schema)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'investment', 'profit', 'reinvestment', 'withdrawal')),
  amount numeric(15,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON profiles;

DROP POLICY IF EXISTS "investment_plans_select_active" ON investment_plans;
DROP POLICY IF EXISTS "investment_plans_service_role_all" ON investment_plans;

DROP POLICY IF EXISTS "investments_select_own" ON investments;
DROP POLICY IF EXISTS "investments_insert_own" ON investments;
DROP POLICY IF EXISTS "investments_service_role_all" ON investments;

DROP POLICY IF EXISTS "deposit_requests_select_own" ON deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_insert_own" ON deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_service_role_all" ON deposit_requests;

DROP POLICY IF EXISTS "withdrawal_requests_select_own" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_insert_own" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_service_role_all" ON withdrawal_requests;

DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
DROP POLICY IF EXISTS "transactions_service_role_all" ON transactions;

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role_all"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Investment plans policies
CREATE POLICY "investment_plans_select_active"
  ON investment_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "investment_plans_service_role_all"
  ON investment_plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Investments policies
CREATE POLICY "investments_select_own"
  ON investments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "investments_insert_own"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "investments_service_role_all"
  ON investments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Deposit requests policies
CREATE POLICY "deposit_requests_select_own"
  ON deposit_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "deposit_requests_insert_own"
  ON deposit_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "deposit_requests_service_role_all"
  ON deposit_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Withdrawal requests policies
CREATE POLICY "withdrawal_requests_select_own"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "withdrawal_requests_insert_own"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "withdrawal_requests_service_role_all"
  ON withdrawal_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Transactions policies
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_service_role_all"
  ON transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, btc_wallet, usdt_wallet)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'btc_wallet', ''),
    COALESCE(NEW.raw_user_meta_data->>'usdt_wallet', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_plans_updated_at ON investment_plans;
CREATE TRIGGER update_investment_plans_updated_at
  BEFORE UPDATE ON investment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deposit_requests_updated_at ON deposit_requests;
CREATE TRIGGER update_deposit_requests_updated_at
  BEFORE UPDATE ON deposit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for data integrity
DO $$
BEGIN
  -- Add balance check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_balance_non_negative' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
  END IF;

  -- Add investment amount check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_investment_amount_positive' 
    AND table_name = 'investments'
  ) THEN
    ALTER TABLE investments ADD CONSTRAINT check_investment_amount_positive CHECK (amount > 0);
  END IF;

  -- Add deposit amount check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_deposit_amount_positive' 
    AND table_name = 'deposit_requests'
  ) THEN
    ALTER TABLE deposit_requests ADD CONSTRAINT check_deposit_amount_positive CHECK (amount > 0);
  END IF;

  -- Add withdrawal amount check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_withdrawal_amount_positive' 
    AND table_name = 'withdrawal_requests'
  ) THEN
    ALTER TABLE withdrawal_requests ADD CONSTRAINT check_withdrawal_amount_positive CHECK (amount > 0);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_balance ON profiles(balance) WHERE balance > 0;

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_plan_id ON investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

-- Insert default investment plans (only if they don't exist)
INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description) 
SELECT * FROM (VALUES
  ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey'),
  ('Silver', 1000, 4990, 10, 48, 'Intermediate plan with balanced risk and returns'),
  ('Gold', 5000, 10000, 15, 72, 'Advanced plan for experienced investors'),
  ('Platinum', 10000, 100000, 20, 168, 'Premium plan with maximum returns for high-value investors')
) AS new_plans(name, min_amount, max_amount, roi, duration_hours, description)
WHERE NOT EXISTS (
  SELECT 1 FROM investment_plans WHERE investment_plans.name = new_plans.name
);