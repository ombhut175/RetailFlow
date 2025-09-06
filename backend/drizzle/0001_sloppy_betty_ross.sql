-- Placeholder migration file created to match migration meta/history
-- Original migration file is missing from the repo but referenced in drizzle meta snapshots.
-- This file is intentionally a no-op to allow the migrator to continue.

DO $$ BEGIN
  -- no-op
  IF NOT EXISTS (SELECT 1) THEN
    NULL;
  END IF;
END $$;
