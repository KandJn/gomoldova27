-- Add available_seats column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats integer NOT NULL DEFAULT 4;

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;

-- Create new policies
CREATE POLICY "Anyone can view trips" 
ON trips 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own trips" 
ON trips 
FOR UPDATE 
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS trips_available_seats_idx ON trips (available_seats);

-- Backfill existing trips with default value if needed
UPDATE trips SET available_seats = 4 WHERE available_seats IS NULL; 