-- Manual migration to convert users table id from serial to UUID
-- Step 1: Drop existing constraints and columns
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_supabase_user_id_unique";
ALTER TABLE "users" DROP COLUMN IF EXISTS "supabase_user_id";

-- Step 2: Drop existing data (development only)
TRUNCATE TABLE "users";

-- Step 3: Drop the old id column
ALTER TABLE "users" DROP COLUMN "id";

-- Step 4: Add new UUID id column as primary key
ALTER TABLE "users" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;