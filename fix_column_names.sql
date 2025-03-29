-- First, check the current structure of the bus_companies table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bus_companies';

-- If the table has columns with different names than expected, rename them
-- For example, if the column is 'name' instead of 'company_name':
ALTER TABLE IF EXISTS bus_companies RENAME COLUMN name TO company_name;

-- Or if the column is 'business_name' instead of 'company_name':
-- ALTER TABLE IF EXISTS bus_companies RENAME COLUMN business_name TO company_name;

-- If the column doesn't exist at all, add it:
ALTER TABLE IF EXISTS bus_companies ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS bus_companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS bus_companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS bus_companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; 