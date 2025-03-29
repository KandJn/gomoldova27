-- First, let's check if the user exists in auth.users
SELECT * FROM auth.users WHERE email = 'bus@mail.com';

-- If the user doesn't exist, we need to create them first
-- Note: This should be done through the Supabase Auth UI or API
-- The password should be set to 'MDTRANS'

-- Once the user is created, let's ensure they have a profile
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
  id,
  'Bus Company',
  NULL
FROM auth.users
WHERE email = 'bus@mail.com'
ON CONFLICT (id) DO NOTHING;

-- Now, let's create the bus company profile
INSERT INTO public.bus_companies (
  user_id,
  company_name,
  email,
  phone,
  description,
  verification_status,
  is_active
)
SELECT 
  p.id,
  'Bus Company',
  'bus@mail.com',
  NULL,
  'Bus transportation company',
  'pending',
  true
FROM public.profiles p
WHERE p.id IN (
  SELECT id FROM auth.users WHERE email = 'bus@mail.com'
)
ON CONFLICT (user_id) DO UPDATE
SET 
  company_name = EXCLUDED.company_name,
  email = EXCLUDED.email,
  verification_status = EXCLUDED.verification_status,
  is_active = EXCLUDED.is_active;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.bus_companies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 