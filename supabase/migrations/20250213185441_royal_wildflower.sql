\n\n-- Drop existing problematic policies\nDROP POLICY IF EXISTS "Users can create bookings" ON bookings;
\nDROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
\n\n-- Create new booking policies\nCREATE POLICY "Users can create bookings"\n  ON bookings FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    -- User must be authenticated\n    auth.uid() = user_id AND\n    -- User must not be the driver\n    NOT EXISTS (\n      SELECT 1\n      FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id = auth.uid()\n    ) AND\n    -- Trip must have available seats\n    EXISTS (\n      SELECT 1\n      FROM trips t\n      LEFT JOIN (\n        SELECT trip_id, COUNT(*) as accepted_count\n        FROM bookings\n        WHERE status = 'accepted'\n        GROUP BY trip_id\n      ) b ON b.trip_id = t.id\n      WHERE t.id = trip_id\n      AND (t.seats > COALESCE(b.accepted_count, 0))\n    )\n  );
\n\nCREATE POLICY "Users can view their bookings"\n  ON bookings FOR SELECT\n  TO authenticated\n  USING (\n    auth.uid() = user_id OR\n    EXISTS (\n      SELECT 1 FROM trips\n      WHERE id = trip_id\n      AND driver_id = auth.uid()\n    )\n  );
\n\n-- Add indexes for better performance if they don't exist\nCREATE INDEX IF NOT EXISTS idx_bookings_trip_status ON bookings(trip_id, status);
\nCREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
\n\n-- Refresh materialized view\nREFRESH MATERIALIZED VIEW trip_seats;
;
