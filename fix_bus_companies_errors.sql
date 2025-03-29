-- First, let's check the current structure of the bus_companies table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bus_companies'
ORDER BY column_name;

-- Let's check if the table has any data
SELECT COUNT(*) FROM bus_companies;

-- Let's check for any constraints or foreign keys
SELECT con.conname, con.contype, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'bus_companies';

-- Let's check for any triggers
SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'bus_companies'::regclass;

-- Let's check for any indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'bus_companies';

-- Let's check for any RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'bus_companies';

-- Now let's try to insert a test record to see what works
DO $$
BEGIN
    BEGIN
        INSERT INTO bus_companies (company_name, email, phone, status)
        VALUES ('Test Company', 'test@example.com', '+37312345678', 'pending');
        RAISE NOTICE 'Insert succeeded with company_name';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Insert with company_name failed: %', SQLERRM;
        
        -- Try with different column combinations
        BEGIN
            INSERT INTO bus_companies (email, phone, status)
            VALUES ('test2@example.com', '+37312345679', 'pending');
            RAISE NOTICE 'Insert succeeded without company_name';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Insert without company_name failed: %', SQLERRM;
        END;
    END;
END $$; 