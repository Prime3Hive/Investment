/*
  # Fix handle_new_user Trigger Function
  
  This migration improves the handle_new_user function to:
  1. Add more robust error handling
  2. Add detailed logging for debugging
  3. Ensure profile creation even if metadata is missing
  4. Fix potential issues with accessing user metadata
*/

-- Drop and recreate the handle_new_user function with improved error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name TEXT;
  btc_wallet TEXT;
  usdt_wallet TEXT;
  meta_data JSONB;
BEGIN
  -- Log the start of the function and the raw user data for debugging
  RAISE LOG 'handle_new_user: Starting for user %', NEW.id;
  RAISE LOG 'handle_new_user: Raw user meta data: %', NEW.raw_user_meta_data;
  
  -- Safely extract user metadata with fallbacks
  BEGIN
    -- Get the metadata safely
    meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Extract values with fallbacks
    user_name := COALESCE(
      meta_data->>'name',
      NEW.email,
      'New User'
    );
    
    btc_wallet := COALESCE(meta_data->>'btc_wallet', '');
    usdt_wallet := COALESCE(meta_data->>'usdt_wallet', '');
    
    RAISE LOG 'handle_new_user: Extracted name: %, btc_wallet: %, usdt_wallet: %', 
      user_name, btc_wallet, usdt_wallet;
  EXCEPTION WHEN OTHERS THEN
    -- If any error occurs during metadata extraction, use safe defaults
    RAISE LOG 'handle_new_user: Error extracting metadata: %', SQLERRM;
    user_name := COALESCE(NEW.email, 'New User');
    btc_wallet := '';
    usdt_wallet := '';
  END;

  -- Insert the profile with the extracted or default values
  BEGIN
    INSERT INTO public.profiles (id, name, btc_wallet, usdt_wallet)
    VALUES (NEW.id, user_name, btc_wallet, usdt_wallet);
    
    RAISE LOG 'handle_new_user: Successfully created profile for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'handle_new_user: Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add a manual function to create profiles for existing users
CREATE OR REPLACE FUNCTION create_missing_profile(user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the user from auth.users
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF user_record IS NULL THEN
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
  
  -- Call the handle_new_user function manually
  PERFORM handle_new_user();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
