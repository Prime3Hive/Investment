-- Fresh start migration for investment platform

-- Create profiles table
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

-- Create investment_plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_amount numeric(15,2) NOT NULL,
  max_amount numeric(15,2) NOT NULL,
  roi numeric(5,2) NOT NULL,
  duration_hours integer NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investments table
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

-- Create deposit_requests table
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

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'investment', 'profit', 'reinvestment')),
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
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

-- Create function to handle new user registration
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

-- Create function to update updated_at timestamp
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

-- Add constraints for data integrity
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS check_balance_non_negative CHECK (balance >= 0);
ALTER TABLE investments ADD CONSTRAINT IF NOT EXISTS check_investment_amount_positive CHECK (amount > 0);
ALTER TABLE deposit_requests ADD CONSTRAINT IF NOT EXISTS check_deposit_amount_positive CHECK (amount > 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_plan_id ON investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Insert default investment plans
INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description) VALUES
  ('Starter', 50, 1000, 5, 24, 'Perfect for beginners looking to start their investment journey'),
  ('Silver', 1000, 4990, 10, 48, 'Intermediate plan with balanced risk and returns'),
  ('Gold', 5000, 10000, 15, 72, 'Advanced plan for experienced investors'),
  ('Platinum', 10000, 100000, 20, 168, 'Premium plan with maximum returns for high-value investors')
ON CONFLICT DO NOTHING;