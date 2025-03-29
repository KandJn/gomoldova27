-- Disable RLS on bus_companies table
ALTER TABLE public.bus_companies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public insert" ON public.bus_companies;
DROP POLICY IF EXISTS "Allow view own registrations" ON public.bus_companies;
DROP POLICY IF EXISTS "Allow admin full access" ON public.bus_companies;

-- Grant full access to all roles
GRANT ALL ON public.bus_companies TO anon;
GRANT ALL ON public.bus_companies TO authenticated;
GRANT ALL ON public.bus_companies TO service_role;

-- Keep the notifications table and its functions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role; 