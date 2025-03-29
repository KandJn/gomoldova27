\n\n-- Add city columns if they don't exist\nDO $$ \nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'trips' AND column_name = 'from_city'\n  ) THEN\n    ALTER TABLE trips ADD COLUMN from_city text NOT NULL;
\n  END IF;
\n\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'trips' AND column_name = 'to_city'\n  ) THEN\n    ALTER TABLE trips ADD COLUMN to_city text NOT NULL;
\n  END IF;
\nEND $$;
\n\n-- Add index for city search\nCREATE INDEX IF NOT EXISTS idx_trips_cities ON trips(from_city, to_city);
\n\n-- Update RLS policies\nCREATE POLICY "Everyone can view trip cities"\n  ON trips FOR SELECT\n  TO public\n  USING (true);
\n\nCREATE POLICY "Drivers can create trips with cities"\n  ON trips FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    auth.uid() = driver_id AND\n    EXISTS (\n      SELECT 1 FROM profiles\n      WHERE id = auth.uid()\n      AND is_driver = true\n    )\n  );
;
