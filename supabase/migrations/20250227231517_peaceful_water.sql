-- Drop existing problematic policies\nDROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
\nDROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
\nDROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
\n\n-- Create materialized view for available seats\nCREATE MATERIALIZED VIEW IF NOT EXISTS available_seats AS\nSELECT \n  t.id as trip_id,\n  t.seats as total_seats,\n  COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'accepted'), 0) as booked_seats,\n  t.seats - COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'accepted'), 0) as seats_left\nFROM trips t\nLEFT JOIN bookings b ON b.trip_id = t.id\nGROUP BY t.id, t.seats;
\n\n-- Create function to refresh available seats\nCREATE OR REPLACE FUNCTION refresh_available_seats()\nRETURNS trigger AS $$\nBEGIN\n  REFRESH MATERIALIZED VIEW CONCURRENTLY available_seats;
\n  RETURN NULL;
\nEND;
\n$$ LANGUAGE plpgsql;
\n\n-- Create trigger to refresh available seats\nDROP TRIGGER IF EXISTS refresh_available_seats_trigger ON bookings;
\nCREATE TRIGGER refresh_available_seats_trigger\n  AFTER INSERT OR UPDATE OR DELETE ON bookings\n  FOR EACH STATEMENT\n  EXECUTE FUNCTION refresh_available_seats();
\n\n-- Create new simplified booking policies\nCREATE POLICY "allow_booking_creation"\n  ON bookings FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    -- User must be authenticated and not the driver\n    auth.uid() = user_id AND\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      LEFT JOIN available_seats a ON a.trip_id = t.id\n      WHERE t.id = trip_id\n      AND t.driver_id != auth.uid()\n      AND a.seats_left > 0\n    )\n  );
\n\nCREATE POLICY "allow_booking_viewing"\n  ON bookings FOR SELECT\n  TO authenticated\n  USING (\n    -- Users can see their own bookings or bookings for trips they drive\n    auth.uid() = user_id OR\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      WHERE t.id = trip_id \n      AND t.driver_id = auth.uid()\n    )\n  );
\n\nCREATE POLICY "allow_booking_updates"\n  ON bookings FOR UPDATE\n  TO authenticated\n  USING (\n    -- Only drivers can update bookings for their trips\n    EXISTS (\n      SELECT 1 \n      FROM trips t\n      WHERE t.id = trip_id \n      AND t.driver_id = auth.uid()\n    )\n  )\n  WITH CHECK (\n    -- Only allow valid status values\n    status IN ('accepted', 'rejected', 'cancelled')\n  );
\n\n-- Create function to check available seats before accepting\nCREATE OR REPLACE FUNCTION check_available_seats_before_accept()\nRETURNS trigger AS $$\nBEGIN\n  IF NEW.status = 'accepted' THEN\n    -- Check if there are available seats\n    IF NOT EXISTS (\n      SELECT 1\n      FROM available_seats a\n      WHERE a.trip_id = NEW.trip_id\n      AND a.seats_left > 0\n    ) THEN\n      RAISE EXCEPTION 'No available seats for this trip';
\n    END IF;
\n  END IF;
\n  RETURN NEW;
\nEND;
\n$$ LANGUAGE plpgsql;
\n\n-- Create trigger for checking available seats\nDROP TRIGGER IF EXISTS check_seats_before_accept ON bookings;
\nCREATE TRIGGER check_seats_before_accept\n  BEFORE UPDATE OF status ON bookings\n  FOR EACH ROW\n  WHEN (NEW.status = 'accepted')\n  EXECUTE FUNCTION check_available_seats_before_accept();
\n\n-- Refresh materialized view\nREFRESH MATERIALIZED VIEW available_seats;
;
