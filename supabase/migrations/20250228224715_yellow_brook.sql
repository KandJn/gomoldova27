-- Add verification fields to profiles if they don't exist\nDO $$ \nBEGIN\n  -- Add verification fields\n  ALTER TABLE profiles\n    ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified',\n    ADD COLUMN IF NOT EXISTS verification_notes text,\n    ADD COLUMN IF NOT EXISTS verified_at timestamptz,\n    ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),\n    ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,\n    ADD COLUMN IF NOT EXISTS block_reason text,\n    ADD COLUMN IF NOT EXISTS blocked_at timestamptz,\n    ADD COLUMN IF NOT EXISTS blocked_by uuid REFERENCES auth.users(id);
\n\n  -- Add constraint for verification status\n  ALTER TABLE profiles \n    ADD CONSTRAINT check_verification_status \n    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
\nEND $$;
\n\n-- Create index for verification status\nCREATE INDEX IF NOT EXISTS idx_profiles_verification_status \n  ON profiles(verification_status);
\n\n-- Create index for blocked status  \nCREATE INDEX IF NOT EXISTS idx_profiles_blocked \n  ON profiles(is_blocked);
\n\n-- Refresh materialized view (without IF EXISTS)\nDO $$ \nBEGIN\n  REFRESH MATERIALIZED VIEW trip_seats;
\nEXCEPTION\n  WHEN undefined_table THEN\n    NULL;
\nEND $$;
;
