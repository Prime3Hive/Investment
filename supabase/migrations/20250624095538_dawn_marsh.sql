/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current admin policies query the profiles table within the policy itself
    - This creates infinite recursion when checking admin status
    - Error: "infinite recursion detected in policy for relation profiles"

  2. Solution
    - Remove the recursive admin policies that query profiles table
    - Keep simple user-based policies that don't cause recursion
    - Admin operations should be handled through service role or separate functions

  3. Changes
    - Drop problematic admin policies
    - Keep safe user policies for own data access
    - Ensure users can read/update their own profiles without recursion
*/

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Keep the safe policies that don't cause recursion
-- These policies are already present and working correctly:
-- - "Users can insert own profile" 
-- - "Users can read own profile"
-- - "Users can update own profile"
-- - "Service role can manage all profiles"

-- The service role policy allows backend operations without RLS restrictions
-- Admin operations should be handled through service role or edge functions
-- This prevents the infinite recursion while maintaining security