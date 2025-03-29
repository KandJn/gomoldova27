-- Add new fields to bus_companies table for enhanced registration
DO $$ 
BEGIN
    -- Add owner_id if it doesn't exist (replacing user_id for consistency)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN owner_id UUID REFERENCES auth.users(id);
        
        -- If user_id exists, copy values to owner_id
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'bus_companies' 
            AND column_name = 'user_id'
        ) THEN
            UPDATE bus_companies SET owner_id = user_id WHERE owner_id IS NULL;
        END IF;
    END IF;

    -- Add registration_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'registration_number'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN registration_number TEXT;
    END IF;

    -- Add tax_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'tax_id'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN tax_id TEXT;
    END IF;

    -- Add address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN address TEXT;
    END IF;

    -- Add city if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN city TEXT;
    END IF;

    -- Add country if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN country TEXT DEFAULT 'Moldova';
    END IF;

    -- Add website if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'website'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN website TEXT;
    END IF;

    -- Add company_size if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'company_size'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN company_size TEXT;
    END IF;

    -- Add year_founded if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'year_founded'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN year_founded INTEGER;
    END IF;

    -- Add contact_person_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'contact_person_name'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN contact_person_name TEXT;
    END IF;

    -- Add contact_person_position if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'contact_person_position'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN contact_person_position TEXT;
    END IF;

    -- Add approved_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add rejected_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add approval_code if it doesn't exist (for email verification)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'approval_code'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN approval_code TEXT;
    END IF;

    -- Add password_set if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'password_set'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN password_set BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index on the new fields
CREATE INDEX IF NOT EXISTS idx_bus_companies_registration_number ON bus_companies(registration_number);
CREATE INDEX IF NOT EXISTS idx_bus_companies_country ON bus_companies(country);
CREATE INDEX IF NOT EXISTS idx_bus_companies_city ON bus_companies(city); 