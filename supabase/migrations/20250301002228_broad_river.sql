-- Drop existing policies if they exist\nDO $$ \nBEGIN\n  DROP POLICY IF EXISTS "verification_request_policy" ON profiles;
\n  DROP POLICY IF EXISTS "admin_verification_policy" ON profiles;
\n  DROP POLICY IF EXISTS "user_verification_request_policy" ON profiles;
\n  DROP POLICY IF EXISTS "admin_user_verification_policy" ON profiles;
\nEND $$;
\n\n-- Create new policies with unique names\nCREATE POLICY "user_can_request_verification"\n  ON profiles FOR UPDATE\n  TO authenticated\n  USING (auth.uid() = id)\n  WITH CHECK (\n    auth.uid() = id AND\n    verification_status = 'pending'\n  );
\n\nCREATE POLICY "admin_can_manage_verification"\n  ON profiles FOR UPDATE\n  TO authenticated\n  USING (auth.email() = 'asassin.damian@gmail.com')\n  WITH CHECK (auth.email() = 'asassin.damian@gmail.com');
\n\n-- Refresh any related views\nREFRESH MATERIALIZED VIEW trip_seats;
;
