\n\n-- Drop existing problematic policy\nDROP POLICY IF EXISTS "Users can create bookings" ON bookings;
\n\n-- Create function to count accepted bookings\nCREATE OR REPLACE FUNCTION get_accepted_bookings_count(trip_id bigint)\nRETURNS bigint AS $$\n  SELECT COUNT(*)\n  FROM bookings\n  WHERE trip_id = $1 AND status = 'accepted';
\n$$ LANGUAGE sql STABLE;
\n\n-- Create new non-recursive policy for bookings\nCREATE POLICY "Users can create bookings"\n  ON bookings FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    -- User must be authenticated and not the driver\n    auth.uid() = user_id AND\n    NOT EXISTS (\n      SELECT 1\n      FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id = auth.uid()\n    ) AND\n    -- Trip must exist and have available seats\n    EXISTS (\n      SELECT 1\n      FROM trips t\n      WHERE t.id = trip_id\n      AND t.seats > get_accepted_bookings_count(t.id)\n    )\n  );
\n\n-- Add indexes for better performance\nCREATE INDEX IF NOT EXISTS idx_bookings_trip_status ON bookings(trip_id, status);
\nCREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
;
