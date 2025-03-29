-- Create bus company profile for the existing user
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
  '60ffb236-443c-45bf-8072-aca0c5a8cade',
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
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  verification_status = 'verified',
  is_active = true;

-- Enable RLS (Row Level Security) on bus_companies table
ALTER TABLE public.bus_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for bus_companies
CREATE POLICY select_bus_companies ON public.bus_companies
  FOR SELECT
  USING (true);

CREATE POLICY insert_bus_companies ON public.bus_companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_bus_companies ON public.bus_companies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.bus_companies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 