-- Drop the existing table if it exists
DROP TABLE IF EXISTS bus_companies;

-- Create the bus_companies table with the correct structure
CREATE TABLE bus_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can do everything" 
ON bus_companies 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can view approved companies" 
ON bus_companies 
FOR SELECT 
TO anon 
USING (status = 'approved');

CREATE POLICY "Bus companies can view their own data" 
ON bus_companies 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Create indexes for faster queries
CREATE INDEX idx_bus_companies_status ON bus_companies(status);
CREATE INDEX idx_bus_companies_email ON bus_companies(email);

-- Create a function to handle status changes
CREATE OR REPLACE FUNCTION notify_bus_company_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = now();
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    NEW.rejected_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the function
CREATE TRIGGER bus_company_status_change
BEFORE UPDATE ON bus_companies
FOR EACH ROW
EXECUTE FUNCTION notify_bus_company_status_change(); 