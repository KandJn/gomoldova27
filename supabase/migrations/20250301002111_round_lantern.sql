-- Drop existing policies if they exist\nDO $$ \nBEGIN\n  DROP POLICY IF EXISTS "booking_insert_verified" ON bookings;
\n  DROP POLICY IF EXISTS "booking_select" ON bookings;
\n  DROP POLICY IF EXISTS "booking_update" ON bookings;
\nEND $$;
\n\n-- Create new booking policies that check user verification status\nCREATE POLICY "booking_insert_verified"\n  ON bookings FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    -- User must be authenticated and verified\n    auth.uid() = user_id AND\n    EXISTS (\n      SELECT 1 FROM profiles p\n      WHERE p.id = auth.uid()\n      AND p.verification_status = 'verified'\n    ) AND\n    -- User cannot book their own trip and there must be available seats\n    EXISTS (\n      SELECT 1 FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id != auth.uid()\n      AND t.seats > (\n        SELECT COUNT(*)\n        FROM bookings b\n        WHERE b.trip_id = t.id\n        AND b.status = 'accepted'\n      )\n    )\n  );
\n\nCREATE POLICY "booking_select"\n  ON bookings FOR SELECT\n  TO authenticated\n  USING (\n    -- Users can see their own bookings\n    auth.uid() = user_id OR\n    -- Drivers can see bookings for their trips\n    EXISTS (\n      SELECT 1 FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id = auth.uid()\n    )\n  );
\n\nCREATE POLICY "booking_update"\n  ON bookings FOR UPDATE\n  TO authenticated\n  USING (\n    -- Only drivers can update bookings for their trips\n    EXISTS (\n      SELECT 1 FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id = auth.uid()\n    )\n  )\n  WITH CHECK (\n    -- Only allow valid status values\n    status IN ('accepted', 'rejected', 'cancelled')\n  );
\n\n-- Refresh materialized view\nREFRESH MATERIALIZED VIEW trip_seats;
;
