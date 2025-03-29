-- Drop existing foreign key constraints if they exist
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_user_id_fkey'
    ) THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_trip_id_fkey'
    ) THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_trip_id_fkey;
    END IF;
END $$;

-- Make sure the columns exist and are of the correct type
ALTER TABLE bookings 
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
    ALTER COLUMN trip_id TYPE uuid USING trip_id::uuid;

ALTER TABLE trips
    ALTER COLUMN driver_id TYPE uuid USING driver_id::uuid;

-- Add foreign key constraints with proper ON DELETE actions
ALTER TABLE bookings
    ADD CONSTRAINT bookings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE bookings
    ADD CONSTRAINT bookings_trip_id_fkey 
    FOREIGN KEY (trip_id) 
    REFERENCES trips(id) 
    ON DELETE CASCADE;

ALTER TABLE trips
    ADD CONSTRAINT trips_driver_id_fkey 
    FOREIGN KEY (driver_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);

-- Add status enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Make sure the status column uses the enum
ALTER TABLE bookings 
    ALTER COLUMN status TYPE booking_status 
    USING status::booking_status;

-- Add created_at column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE bookings ADD COLUMN created_at timestamptz DEFAULT now();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy for viewing bookings (user is either the passenger or the driver of the trip)
CREATE POLICY view_bookings ON bookings
    FOR SELECT
    USING (
        user_id = auth.uid() OR 
        trip_id IN (
            SELECT id FROM trips WHERE driver_id = auth.uid()
        )
    );

-- Policy for creating bookings (any authenticated user can create a booking)
CREATE POLICY create_bookings ON bookings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for updating bookings (only the driver of the trip can update the status)
CREATE POLICY update_bookings ON bookings
    FOR UPDATE
    USING (
        trip_id IN (
            SELECT id FROM trips WHERE driver_id = auth.uid()
        )
    ); 