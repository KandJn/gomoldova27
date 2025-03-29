\n\n-- Drop existing problematic foreign key if it exists\nALTER TABLE IF EXISTS bookings\n  DROP CONSTRAINT IF EXISTS bookings_trip_id_fkey;
\n\n-- Add proper foreign key constraint\nALTER TABLE bookings\n  ADD CONSTRAINT bookings_trip_id_fkey \n  FOREIGN KEY (trip_id) \n  REFERENCES trips(id)\n  ON DELETE CASCADE;
\n\n-- Add indexes for better query performance\nCREATE INDEX IF NOT EXISTS idx_bookings_trip_user ON bookings(trip_id, user_id);
\nCREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
\n\n-- Refresh materialized view to ensure it's using correct relationships\nREFRESH MATERIALIZED VIEW trip_seats;
;
