-- Add company_id column to trips table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE trips 
        ADD COLUMN company_id UUID REFERENCES bus_companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for company_id if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'trips' 
        AND indexname = 'idx_trips_company'
    ) THEN
        CREATE INDEX idx_trips_company ON trips(company_id);
    END IF;
END $$; 