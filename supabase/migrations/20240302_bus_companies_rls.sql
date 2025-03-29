-- First, disable RLS to reset everything
ALTER TABLE public.bus_companies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public registration" ON public.bus_companies;
DROP POLICY IF EXISTS "Allow public view own registrations" ON public.bus_companies;
DROP POLICY IF EXISTS "Allow admins full access" ON public.bus_companies;

-- Enable RLS
ALTER TABLE public.bus_companies ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to insert
CREATE POLICY "Allow public insert"
ON public.bus_companies
FOR INSERT
TO public
WITH CHECK (true);

-- Create a policy that allows anyone to view their own registrations
CREATE POLICY "Allow view own registrations"
ON public.bus_companies
FOR SELECT
TO public
USING (true);

-- Create a policy that allows admins full access
CREATE POLICY "Allow admin full access"
ON public.bus_companies
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin'); 