-- Add verification_status column if it doesn't exist\nDO $$ \nBEGIN\n  -- Add column if it doesn't exist\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'profiles' AND column_name = 'verification_status'\n  ) THEN\n    ALTER TABLE profiles ADD COLUMN verification_status text DEFAULT 'unverified';
\n  END IF;
\n\n  -- Drop constraint if it exists\n  IF EXISTS (\n    SELECT 1 FROM information_schema.constraint_column_usage \n    WHERE constraint_name = 'check_verification_status'\n  ) THEN\n    ALTER TABLE profiles DROP CONSTRAINT check_verification_status;
\n  END IF;
\n\n  -- Add constraint\n  ALTER TABLE profiles \n    ADD CONSTRAINT check_verification_status \n    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
\nEND $$;
\n\n-- Create index for verification status if it doesn't exist\nCREATE INDEX IF NOT EXISTS idx_profiles_verification_status \n  ON profiles(verification_status);
\n\n-- Update existing profiles to have unverified status\nUPDATE profiles\nSET verification_status = 'unverified'\nWHERE verification_status IS NULL;
;
