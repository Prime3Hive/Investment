-- Add status column to profiles table
ALTER TABLE profiles ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Create an enum type for user status
CREATE TYPE user_status AS ENUM ('active', 'deactivated', 'banned');

-- Add a check constraint to ensure status is one of the allowed values
ALTER TABLE profiles ADD CONSTRAINT check_status CHECK (status IN ('active', 'deactivated', 'banned'));

-- Create function to update user status
CREATE OR REPLACE FUNCTION update_user_status(user_id UUID, new_status VARCHAR)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET status = new_status
  WHERE id = user_id;
END;
$$;
