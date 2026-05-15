-- ==============================================================
-- Add media support to post_comments
-- ==============================================================

-- 1. Add image_url and audio_url to post_comments if they don't exist
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS audio_url text;
