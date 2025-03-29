-- Add amount_paid column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid decimal(10,2) NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- Create policies
CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON bookings
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS bookings_amount_paid_idx ON bookings (amount_paid); 