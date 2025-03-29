-- Create bus_companies table
CREATE TABLE IF NOT EXISTS bus_companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    description TEXT,
    logo_url TEXT,
    verification_status TEXT DEFAULT 'unverified',
    is_active BOOLEAN DEFAULT true
);

-- Add company_id to trips table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE trips ADD COLUMN company_id UUID REFERENCES bus_companies(id);
    END IF;
END $$;

-- Enable Row Level Security on bus_companies
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for bus_companies
DROP POLICY IF EXISTS "Anyone can view bus companies" ON bus_companies;
DROP POLICY IF EXISTS "Users can create their own bus company" ON bus_companies;
DROP POLICY IF EXISTS "Users can update their own bus company" ON bus_companies;
DROP POLICY IF EXISTS "Users can delete their own bus company" ON bus_companies;

CREATE POLICY "Anyone can view bus companies"
    ON bus_companies FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own bus company"
    ON bus_companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bus company"
    ON bus_companies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bus company"
    ON bus_companies FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bus_companies_user_id ON bus_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_company_id ON trips(company_id);

-- Update trips policies to include company_id
DROP POLICY IF EXISTS "Drivers can create trips" ON trips;
DROP POLICY IF EXISTS "Drivers can update their own trips" ON trips;
DROP POLICY IF EXISTS "Drivers can delete their own trips" ON trips;

CREATE POLICY "Drivers can create trips"
    ON trips FOR INSERT
    WITH CHECK (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM bus_companies 
            WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Drivers can update their own trips"
    ON trips FOR UPDATE
    USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM bus_companies 
            WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Drivers can delete their own trips"
    ON trips FOR DELETE
    USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM bus_companies 
            WHERE id = company_id AND user_id = auth.uid()
        )
    ); 