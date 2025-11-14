-- Migration: Sync auth.users to public.users table
-- This creates a trigger to automatically create users table entries when auth users are created

-- 1. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_full_name TEXT;
BEGIN
  -- Extract name from email or use 'New User' as default
  default_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    email,
    role,
    full_name,
    date_of_birth,
    risk_profile,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'), -- Default to client
    default_full_name,
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE), -- Default DOB
    COALESCE(NEW.raw_user_meta_data->>'risk_profile', 'moderate'), -- Default risk profile
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate entries

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Sync existing auth users to public.users (one-time sync)
INSERT INTO public.users (
  id,
  username,
  email,
  role,
  full_name,
  date_of_birth,
  risk_profile,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'client'),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE((au.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE),
  COALESCE(au.raw_user_meta_data->>'risk_profile', 'moderate'),
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Trigger created: on_auth_user_created';
  RAISE NOTICE 'Existing auth users synced to public.users table';
END $$;
