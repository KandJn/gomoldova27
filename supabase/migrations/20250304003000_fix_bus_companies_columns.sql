-- First, check if we need to rename the name column to company_name
DO $$ 
BEGIN
    -- Check if name column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'name'
    ) THEN
        -- Rename name to company_name if company_name doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'bus_companies' 
            AND column_name = 'company_name'
        ) THEN
            ALTER TABLE bus_companies RENAME COLUMN name TO company_name;
        END IF;
    END IF;

    -- Add company_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'company_name'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN company_name TEXT;
    END IF;

    -- Add user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE bus_companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Make sure id is UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bus_companies' 
        AND column_name = 'id' 
        AND data_type = 'bigint'
    ) THEN
        -- Create a temporary table with the new structure
        CREATE TABLE bus_companies_new (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            company_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Copy data from old table to new table
        INSERT INTO bus_companies_new (
            id,
            user_id,
            company_name,
            email,
            phone,
            status,
            created_at,
            updated_at
        )
        SELECT 
            gen_random_uuid(),
            user_id,
            company_name,
            email,
            phone,
            status,
            created_at,
            COALESCE(updated_at, NOW())
        FROM bus_companies;

        -- Drop old table and rename new table
        DROP TABLE bus_companies;
        ALTER TABLE bus_companies_new RENAME TO bus_companies;

        -- Recreate indexes
        CREATE INDEX idx_bus_companies_user_id ON bus_companies(user_id);
        CREATE INDEX idx_bus_companies_status ON bus_companies(status);
    END IF;
END $$; 