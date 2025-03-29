-- First, let's check if the user exists in profiles
SELECT id, full_name, avatar_url 
FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'bus@mail.com'
);

-- Create or update profile and bus company for the user
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'bus@mail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO public.profiles (
      id,
      full_name,
      avatar_url,
      created_at
    )
    VALUES (
      v_user_id,
      'Bus Company',
      NULL,
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      full_name = EXCLUDED.full_name;

    -- Ensure bus company profile exists
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
      v_user_id,
      'Bus Company',
      'bus@mail.com',
      NULL,
      'Bus transportation company',
      'pending',
      true,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      company_name = EXCLUDED.company_name,
      email = EXCLUDED.email,
      verification_status = EXCLUDED.verification_status,
      is_active = EXCLUDED.is_active;
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.bus_companies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 