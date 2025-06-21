/*
  # Add withdrawal requests table

  1. New Tables
    - `withdrawal_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (decimal)
      - `currency` (text, check constraint)
      - `wallet_address` (text)
      - `status` (text, check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on withdrawal_requests table
    - Add policies for users to read/create their own withdrawal requests
    - Add policies for admins to manage all withdrawal requests
*/

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  currency text CHECK (currency IN ('BTC', 'USDT')) NOT NULL,
  wallet_address text NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'completed', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Withdrawal requests policies
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

-- Create trigger for updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();