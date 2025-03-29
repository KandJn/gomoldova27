-- Based on the error messages:
-- ERROR: 42703: column "name" does not exist
-- ERROR: 42701: column "company_name" of relation "bus_companies" already exists

-- Let's first check the current structure of the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bus_companies'
ORDER BY column_name;

-- The issue seems to be that:
-- 1. We tried to rename a column 'name' to 'company_name', but 'name' doesn't exist
-- 2. We tried to add 'company_name', but it already exists

-- Let's fix the issue in our application code instead of changing the database
-- Here's a SQL command to update the BusCompanyRegistrations component to match the database:

-- First, let's check if there are any NOT NULL constraints on company_name
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'bus_companies' AND column_name = 'company_name';

-- If company_name exists but has data issues, let's fix them:
UPDATE bus_companies
SET company_name = 'Company ' || id::text
WHERE company_name IS NULL OR company_name = '';

-- Let's also make sure the other required columns have valid data:
UPDATE bus_companies
SET email = 'company' || id::text || '@example.com'
WHERE email IS NULL OR email = '';

UPDATE bus_companies
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Let's check if there are any records with issues:
SELECT id, company_name, email, phone, status
FROM bus_companies
WHERE company_name IS NULL OR email IS NULL OR status IS NULL;

-- If you need to recreate the table completely (as a last resort),
-- you can use the recreate_bus_companies_table.sql script,
-- but be aware that this will delete all existing data.

-- Drop all dependent objects first
DROP MATERIALIZED VIEW IF EXISTS available_seats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS trip_seats CASCADE;
DROP VIEW IF EXISTS trips_with_profiles CASCADE;
DROP FUNCTION IF EXISTS verify_user CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;

-- Drop existing policies for bookings
DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS bus_companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.verify_user;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  travel_preferences JSONB,
  verification_status TEXT DEFAULT 'unverified',
  id_verified BOOLEAN DEFAULT false,
  license_verified BOOLEAN DEFAULT false,
  id_number TEXT,
  driver_license TEXT,
  verification_notes TEXT
);

-- Create bus_companies table
CREATE TABLE bus_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  logo_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Enable Row Level Security on bus_companies table
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for bus_companies table
CREATE POLICY "Anyone can view bus companies"
ON bus_companies FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can view their own bus company"
ON bus_companies FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create bus company"
ON bus_companies FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bus company"
ON bus_companies FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for bus_companies
CREATE INDEX IF NOT EXISTS idx_bus_companies_user_id ON bus_companies(user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert profiles for existing users who don't have one
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
  id,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Create verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('id', 'email', 'phone')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  data JSONB,
  notes TEXT
);

-- Enable Row Level Security on verifications table
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for verifications table
CREATE POLICY "Anyone can view verifications"
ON verifications FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can view their own verifications"
ON verifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create verifications"
ON verifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update verifications"
ON verifications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND verification_status = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND verification_status = 'admin'
  )
);

CREATE POLICY "Admin can delete verifications"
ON verifications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND verification_status = 'admin'
  )
);

-- Create index for verifications
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_type ON verifications(type);

-- Create verification function in public schema
CREATE OR REPLACE FUNCTION public.verify_user(
  user_id UUID,
  verification_type TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF verification_type = 'id' THEN
    UPDATE public.profiles
    SET 
      id_verified = true,
      verification_status = CASE 
        WHEN license_verified THEN 'verified'
        ELSE 'partially_verified'
      END,
      verification_notes = notes
    WHERE id = user_id;
  ELSIF verification_type = 'license' THEN
    UPDATE public.profiles
    SET 
      license_verified = true,
      verification_status = CASE 
        WHEN id_verified THEN 'verified'
        ELSE 'partially_verified'
      END,
      verification_notes = notes
    WHERE id = user_id;
  ELSIF verification_type = 'both' THEN
    UPDATE public.profiles
    SET 
      id_verified = true,
      license_verified = true,
      verification_status = 'verified',
      verification_notes = notes
    WHERE id = user_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_user TO authenticated;

-- Create policy for admin to execute the function
CREATE POLICY "Admin can verify users"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND verification_status = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND verification_status = 'admin'
  )
);

-- Create trips table with explicit foreign key constraints
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  driver_id UUID NOT NULL REFERENCES profiles(id),
  company_id UUID REFERENCES bus_companies(id),
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  from_coordinates JSONB,
  to_coordinates JSONB,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE,
  arrival_time TIME,
  price DECIMAL(10,2) NOT NULL,
  seats INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled',
  vehicle_type TEXT DEFAULT 'car'
);

-- Create bookings table with explicit foreign key constraints
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  seats INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  UNIQUE(trip_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create new policies for trips
CREATE POLICY "Anyone can view trips"
ON trips FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can view their own trips"
ON trips FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

CREATE POLICY "Users can create trips"
ON trips FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Users can update their own trips"
ON trips FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Users can delete their own trips"
ON trips FOR DELETE
TO authenticated
USING (driver_id = auth.uid());

-- Create new policies for bookings
CREATE POLICY "Anyone can view bookings"
ON bookings FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Verified users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.verification_status = 'verified'
  )
);

CREATE POLICY "Users can update their own bookings"
ON bookings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bookings"
ON bookings FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create new policies for profiles
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_company_id ON trips(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Recreate views and materialized views
CREATE VIEW trips_with_profiles AS
SELECT 
  t.*,
  p.full_name as driver_full_name,
  p.avatar_url as driver_avatar_url,
  p.phone as driver_phone
FROM trips t
LEFT JOIN profiles p ON t.driver_id = p.id;

CREATE MATERIALIZED VIEW trip_seats AS
SELECT 
  t.id as trip_id,
  t.seats as total_seats,
  COALESCE(SUM(b.seats), 0) as booked_seats,
  t.seats - COALESCE(SUM(b.seats), 0) as available_seats
FROM trips t
LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'accepted'
GROUP BY t.id, t.seats;

CREATE MATERIALIZED VIEW available_seats AS
SELECT 
  t.id as trip_id,
  t.seats - COALESCE(SUM(b.seats), 0) as available_seats
FROM trips t
LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'accepted'
GROUP BY t.id, t.seats; 