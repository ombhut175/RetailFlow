-- drop constraint if it exists
DO $$ BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'users_supabase_user_id_unique'
	) THEN
		EXECUTE 'ALTER TABLE "users" DROP CONSTRAINT "users_supabase_user_id_unique"';
	END IF;
END $$;--> statement-breakpoint

-- change column type to uuid only if it's not uuid
DO $$ BEGIN
	IF (SELECT atttypid::regtype::text FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'id') <> 'uuid' THEN
		EXECUTE 'ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING ("id"::uuid)';
	END IF;
END $$;--> statement-breakpoint

-- set default if not already set
DO $$ BEGIN
	PERFORM 1 FROM pg_attrdef WHERE adrelid = 'users'::regclass AND adnum = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'id');
	IF NOT FOUND THEN
		EXECUTE 'ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()';
	END IF;
END $$;--> statement-breakpoint

-- drop column if exists
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='supabase_user_id') THEN
		EXECUTE 'ALTER TABLE "users" DROP COLUMN "supabase_user_id"';
	END IF;
END $$;