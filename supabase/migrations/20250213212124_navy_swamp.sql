-- Drop problematic policies\nDROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
\nDROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
\nDROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
\n\n-- Create non-recursive booking policies\nCREATE POLICY "bookings_insert_policy"\n  ON bookings FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    -- User must be authenticated and not the driver\n    auth.uid() = user_id AND\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      WHERE t.id = trip_id\n      AND t.driver_id != auth.uid()\n      AND t.seats > (\n        SELECT COUNT(*)\n        FROM bookings b\n        WHERE b.trip_id = t.id\n        AND b.status = 'accepted'\n      )\n    )\n  );
\n\nCREATE POLICY "bookings_select_policy"\n  ON bookings FOR SELECT\n  TO authenticated\n  USING (\n    auth.uid() = user_id OR\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      WHERE t.id = trip_id \n      AND t.driver_id = auth.uid()\n    )\n  );
\n\nCREATE POLICY "bookings_update_policy"\n  ON bookings FOR UPDATE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      WHERE t.id = trip_id \n      AND t.driver_id = auth.uid()\n    )\n  )\n  WITH CHECK (\n    status IN ('accepted', 'rejected', 'cancelled')\n  );
\n\n-- Refresh materialized view\nREFRESH MATERIALIZED VIEW trip_seats;
;
