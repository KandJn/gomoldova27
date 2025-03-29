-- STEP 1: Check if the specified user ID exists in auth.users
SELECT * FROM auth.users WHERE email = 'bus@mail.com';

-- STEP 2: Update the profile for this user (Use your actual user ID here)
INSERT INTO public.profiles (
  id,
  full_name,
  avatar_url,
  verification_status,
  id_verified,
  license_verified,
  created_at
)
VALUES (
  '60ffb236-443c-45bf-8072-aca0c5a8cade', -- ⚠️ THIS SHOULD BE THE ACTUAL USER ID
  'Bus Company',
  NULL,
  'verified',
  true,
  true,
  now()
)
ON CONFLICT (id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  verification_status = 'verified',
  id_verified = true,
  license_verified = true;

-- STEP 3: Create the bus company entry for this user
INSERT INTO public.bus_companies (
  user_id,
  company_name,
  email,
  phone,
  description,
  verification_status,
  is_active,
  created_at
)
VALUES (
  '60ffb236-443c-45bf-8072-aca0c5a8cade', -- ⚠️ THIS SHOULD BE THE ACTUAL USER ID
  'Bus Company',
  'bus@mail.com',
  '0123456789',
  'Bus transportation company',
  'verified',
  true,
  now()
)
ON CONFLICT (user_id) DO UPDATE
SET 
  company_name = EXCLUDED.company_name,
  email = EXCLUDED.email,
  verification_status = 'verified',
  is_active = true;

-- STEP 4: Ensure RLS policies exist for bus_companies
DROP POLICY IF EXISTS select_bus_companies ON public.bus_companies;
DROP POLICY IF EXISTS insert_bus_companies ON public.bus_companies;
DROP POLICY IF EXISTS update_bus_companies ON public.bus_companies;

CREATE POLICY select_bus_companies ON public.bus_companies
  FOR SELECT
  USING (true);

CREATE POLICY insert_bus_companies ON public.bus_companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_bus_companies ON public.bus_companies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- STEP 5: Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.bus_companies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 