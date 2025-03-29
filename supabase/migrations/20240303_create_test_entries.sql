-- Make sure RLS is disabled for direct access
ALTER TABLE public.bus_companies DISABLE ROW LEVEL SECURITY;

-- Create a test bus company entry if none exists
INSERT INTO public.bus_companies (company_name, email, phone, description, status, created_at)
SELECT 'Test Bus Company', 'test@buscompany.com', '+37312345678', 'This is a test bus company for admin panel testing', 'pending', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.bus_companies LIMIT 1
);

-- Insert another test entry with a different status
INSERT INTO public.bus_companies (company_name, email, phone, description, status, created_at)
SELECT 'Approved Bus Co', 'approved@buscompany.com', '+37312345679', 'This is an approved bus company', 'approved', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.bus_companies WHERE status = 'approved' LIMIT 1
);

-- Insert a third test entry with rejected status
INSERT INTO public.bus_companies (company_name, email, phone, description, status, created_at)
SELECT 'Rejected Bus Lines', 'rejected@buscompany.com', '+37312345680', 'This is a rejected bus company', 'rejected', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.bus_companies WHERE status = 'rejected' LIMIT 1
);

-- Grant all permissions on the table to all roles
GRANT ALL ON public.bus_companies TO authenticated;
GRANT ALL ON public.bus_companies TO anon;
GRANT ALL ON public.bus_companies TO service_role;

-- Create a function to get all bus companies
CREATE OR REPLACE FUNCTION public.get_all_bus_companies()
RETURNS SETOF public.bus_companies AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.bus_companies ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.get_all_bus_companies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_bus_companies() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_bus_companies() TO service_role; 