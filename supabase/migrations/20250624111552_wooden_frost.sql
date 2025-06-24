-- Security and Performance Improvements

-- Add missing constraints for data integrity
ALTER TABLE profiles ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
ALTER TABLE investments ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
ALTER TABLE deposit_requests ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
ALTER TABLE withdrawal_requests ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

-- Add email validation constraint
ALTER TABLE profiles ADD CONSTRAINT check_email_format CHECK (
  CASE 
    WHEN id IN (SELECT id FROM auth.users) THEN true
    ELSE false
  END
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_balance ON profiles(balance) WHERE balance > 0;

-- Create function to check admin status (server-side validation)
CREATE OR REPLACE FUNCTION check_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN := false;
BEGIN
  SELECT profiles.is_admin INTO is_admin
  FROM profiles
  WHERE profiles.id = user_id;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_admin_status(UUID) TO authenticated;

-- Create function for secure balance updates with validation
CREATE OR REPLACE FUNCTION update_user_balance_secure(
  user_id UUID, 
  amount_change DECIMAL,
  transaction_type TEXT DEFAULT 'manual'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance DECIMAL;
  new_balance DECIMAL;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + amount_change;
  
  -- Prevent negative balance for withdrawals
  IF new_balance < 0 AND transaction_type IN ('withdrawal', 'investment') THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', current_balance, ABS(amount_change);
  END IF;
  
  -- Update the balance
  UPDATE profiles 
  SET 
    balance = new_balance,
    updated_at = now()
  WHERE id = user_id;
  
  -- Log the balance change for audit
  INSERT INTO transactions (user_id, type, amount, status, description)
  VALUES (
    user_id,
    CASE 
      WHEN amount_change > 0 THEN 'deposit'
      ELSE 'withdrawal'
    END,
    ABS(amount_change),
    'completed',
    'Balance update: ' || transaction_type
  );
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_balance_secure(UUID, DECIMAL, TEXT) TO authenticated;

-- Add audit logging table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" ON audit_logs
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    p_user_id, p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_audit_event(UUID, TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "rate_limits_own_only" ON rate_limits
FOR ALL TO authenticated
USING (user_id = auth.uid());

-- Create indexes for rate limits
CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_limit INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER := 0;
  window_start TIMESTAMPTZ;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent actions
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action = p_action
    AND window_start > window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN false;
  END IF;
  
  -- Record this action
  INSERT INTO rate_limits (user_id, action, window_start)
  VALUES (p_user_id, p_action, now())
  ON CONFLICT (user_id, action) 
  DO UPDATE SET 
    count = rate_limits.count + 1,
    window_start = CASE 
      WHEN rate_limits.window_start < window_start THEN now()
      ELSE rate_limits.window_start
    END;
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated;

-- Clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_rate_limits() TO authenticated;