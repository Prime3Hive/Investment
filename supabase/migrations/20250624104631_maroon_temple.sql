/*
  # Create balance update function

  1. New Functions
    - `update_user_balance` - Safely update user balance with atomic operations
    
  2. Security
    - Function uses security definer to ensure proper permissions
    - Validates user exists before updating
*/

-- Create function to safely update user balance
CREATE OR REPLACE FUNCTION update_user_balance(user_id UUID, amount_change DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's balance atomically
  UPDATE profiles 
  SET 
    balance = balance + amount_change,
    updated_at = now()
  WHERE id = user_id;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  -- Ensure balance doesn't go negative (optional safety check)
  UPDATE profiles 
  SET balance = GREATEST(balance, 0)
  WHERE id = user_id AND balance < 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO authenticated;