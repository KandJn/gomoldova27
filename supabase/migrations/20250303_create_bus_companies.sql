-- Create bus_companies table
CREATE TABLE IF NOT EXISTS bus_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Create RLS policies
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;

-- Policy for admins (can do everything)
CREATE POLICY "Admins can do everything" ON bus_companies
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy for public read of approved companies
CREATE POLICY "Anyone can view approved companies" ON bus_companies
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy for bus companies to view their own data
CREATE POLICY "Bus companies can view their own data" ON bus_companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bus_companies_status ON bus_companies(status);
CREATE INDEX IF NOT EXISTS idx_bus_companies_email ON bus_companies(email);

-- Create function to notify on status change
CREATE OR REPLACE FUNCTION notify_bus_company_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'approved' THEN
      NEW.approved_at = NOW();
    ELSIF NEW.status = 'rejected' THEN
      NEW.rejected_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change
CREATE TRIGGER bus_company_status_change
BEFORE UPDATE ON bus_companies
FOR EACH ROW
EXECUTE FUNCTION notify_bus_company_status_change(); 