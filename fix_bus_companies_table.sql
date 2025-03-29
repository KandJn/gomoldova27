-- First, let's check the current structure of the bus_companies table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bus_companies';

-- If the table exists but has different column names, let's add the missing columns
DO $$
BEGIN
    -- Check if company_name column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bus_companies' AND column_name = 'company_name'
    ) THEN
        -- Check if there's a similar column that might have a different name
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'bus_companies' AND column_name = 'name'
        ) THEN
            -- Rename the column if it exists with a different name
            ALTER TABLE bus_companies RENAME COLUMN name TO company_name;
        ELSE
            -- Add the column if it doesn't exist at all
            ALTER TABLE bus_companies ADD COLUMN company_name TEXT;
        END IF;
    END IF;

    -- Check if email column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bus_companies' AND column_name = 'email'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN email TEXT;
    END IF;

    -- Check if phone column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bus_companies' AND column_name = 'phone'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN phone TEXT;
    END IF;

    -- Check if status column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bus_companies' AND column_name = 'status'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$; 