-- Migration: create posts table with audit fields and FK cascade

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  body text NOT NULL,

  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz,
  deleted_by uuid,
  deleted_at timestamptz
);

-- Foreign key constraints referencing users(id) with cascade on update/delete
ALTER TABLE public.posts
  ADD CONSTRAINT fk_posts_created_by_users FOREIGN KEY (created_by)
    REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.posts
  ADD CONSTRAINT fk_posts_updated_by_users FOREIGN KEY (updated_by)
    REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.posts
  ADD CONSTRAINT fk_posts_deleted_by_users FOREIGN KEY (deleted_by)
    REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
