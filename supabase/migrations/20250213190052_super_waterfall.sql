\n\n-- Ensure required columns exist with proper constraints\nALTER TABLE trips\n  ALTER COLUMN from_city SET NOT NULL,\n  ALTER COLUMN to_city SET NOT NULL;
\n\n-- Drop old columns if they exist\nDO $$ \nBEGIN\n  IF EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'trips' AND column_name = 'from'\n  ) THEN\n    ALTER TABLE trips DROP COLUMN "from";
\n  END IF;
\n\n  IF EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'trips' AND column_name = 'to'\n  ) THEN\n    ALTER TABLE trips DROP COLUMN "to";
\n  END IF;
\nEND $$;
\n\n-- Add or update indexes for better query performance\nDROP INDEX IF EXISTS idx_trips_from_to;
\nDROP INDEX IF EXISTS idx_trips_cities;
\nCREATE INDEX idx_trips_search ON trips(from_city, to_city, date);
\nCREATE INDEX idx_trips_date_time ON trips(date, time);
\n\n-- Add policy for public trip viewing\nCREATE POLICY "Anyone can view trips"\n  ON trips FOR SELECT\n  TO public\n  USING (true);
\n\n-- Refresh materialized view to ensure it's using correct columns\nREFRESH MATERIALIZED VIEW trip_seats;
;
