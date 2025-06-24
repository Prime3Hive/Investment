/*
  # Complete Database Rebuild
  
  This migration completely rebuilds the database schema from scratch:
  
  1. Drops all existing tables and policies
  2. Creates new tables matching frontend requirements
  3. Sets up proper RLS policies without recursion
  4. Creates necessary functions and triggers
  5. Inserts sample data for testing
*/

-- =============================================
-- STEP 1: CLEAN SLATE - DROP EVERYTHING
-- =============================================

-- Drop all existing policies first
DO $$
DECLARE
    policy_record RECORD;
    table_record RECORD;
BEGIN
    -- Drop policies for all tables
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = table_record.tablename AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON ' || table_record.tablename;
        END LOOP;
    END LOOP;
END $$;

-- Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_investment_plans_updated_at ON investment_plans;
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
DROP TRIGGER IF EXISTS update_deposit_requests_updated_at ON deposit_requests;
DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_missing_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS deposit_requests CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS investment_plans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- STEP 2: CREATE UTILITY FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STEP 3: CREATE CORE TABLES
-- =============================================

-- Profiles table (main user data)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    btc_wallet TEXT NOT NULL DEFAULT '',
    usdt_wallet TEXT NOT NULL DEFAULT '',
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investment plans table
CREATE TABLE public.investment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    min_amount NUMERIC(15,2) NOT NULL,
    max_amount NUMERIC(15,2) NOT NULL,
    roi NUMERIC(5,2) NOT NULL,
    duration_hours INTEGER NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investments table
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES investment_plans(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    roi NUMERIC(5,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deposit requests table
CREATE TABLE public.deposit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('BTC', 'USDT')),
    wallet_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal requests table
CREATE TABLE public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('BTC', 'USDT')),
    wallet_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'investment', 'profit', 'reinvestment', 'withdrawal')),
    amount NUMERIC(15,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_plan_id ON investments(plan_id);
CREATE INDEX idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- =============================================
-- STEP 5: CREATE UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_plans_updated_at
    BEFORE UPDATE ON investment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposit_requests_updated_at
    BEFORE UPDATE ON deposit_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
    BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 6: CREATE USER MANAGEMENT FUNCTIONS
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        btc_wallet,
        usdt_wallet,
        balance,
        is_admin
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1), 'User'),
        COALESCE(NEW.raw_user_meta_data->>'btc_wallet', ''),
        COALESCE(NEW.raw_user_meta_data->>'usdt_wallet', ''),
        0,
        false
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually create missing profiles
CREATE OR REPLACE FUNCTION public.create_missing_profile(
    user_id UUID, 
    user_email TEXT, 
    user_name TEXT DEFAULT NULL, 
    btc_wallet TEXT DEFAULT '', 
    usdt_wallet TEXT DEFAULT ''
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        btc_wallet,
        usdt_wallet,
        balance,
        is_admin
    )
    VALUES (
        user_id,
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1), 'User'),
        btc_wallet,
        usdt_wallet,
        0,
        false
    )
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 8: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Investment plans policies (public read, admin manage)
CREATE POLICY "investment_plans_select_active" ON investment_plans
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Investments policies
CREATE POLICY "investments_select_own" ON investments
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "investments_insert_own" ON investments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Deposit requests policies
CREATE POLICY "deposit_requests_select_own" ON deposit_requests
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "deposit_requests_insert_own" ON deposit_requests
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Withdrawal requests policies
CREATE POLICY "withdrawal_requests_select_own" ON withdrawal_requests
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "withdrawal_requests_insert_own" ON withdrawal_requests
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "transactions_select_own" ON transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "transactions_insert_own" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Service role policies (for admin operations)
CREATE POLICY "profiles_service_role_all" ON profiles
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "investment_plans_service_role_all" ON investment_plans
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "investments_service_role_all" ON investments
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "deposit_requests_service_role_all" ON deposit_requests
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "withdrawal_requests_service_role_all" ON withdrawal_requests
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "transactions_service_role_all" ON transactions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- =============================================
-- STEP 9: GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- =============================================
-- STEP 10: INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample investment plans
INSERT INTO investment_plans (name, min_amount, max_amount, roi, duration_hours, description) VALUES
('Starter Plan', 50, 500, 5, 24, 'Perfect for beginners looking to start their investment journey with low risk and guaranteed returns.'),
('Growth Plan', 500, 2500, 10, 72, 'Ideal for investors seeking moderate returns with a balanced risk-reward ratio over 3 days.'),
('Premium Plan', 2500, 10000, 15, 168, 'Designed for serious investors who want substantial returns over a week-long investment period.'),
('Platinum Plan', 10000, 50000, 20, 336, 'Our flagship plan offering maximum returns for high-value investors over two weeks.');

-- Create a test admin user (you'll need to register this user through the frontend first)
-- This is just a placeholder - the actual user will be created when someone registers
-- with the email admin@profitra.com and you can manually set is_admin to true

-- =============================================
-- VERIFICATION QUERIES (for testing)
-- =============================================

-- These queries can be run to verify the setup:
-- SELECT * FROM investment_plans;
-- SELECT * FROM profiles;
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';