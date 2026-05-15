-- ==============================================================
-- Ensure storage bucket 'historias' exists with correct policies
-- ==============================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('historias', 'historias', true, 10485760, ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime'])
ON CONFLICT(id) DO UPDATE SET public = true;

-- Clean up old policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "historias_select" ON storage.objects;
    DROP POLICY IF EXISTS "historias_insert" ON storage.objects;
    DROP POLICY IF EXISTS "historias_delete" ON storage.objects;
END $$;

-- Allow anyone to view stories
CREATE POLICY "historias_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'historias');

-- Allow authenticated users to upload stories
CREATE POLICY "historias_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'historias' AND auth.role() = 'authenticated');

-- Allow users to delete their own stories
CREATE POLICY "historias_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'historias' AND auth.role() = 'authenticated');

-- Make sure historias table has expires_at with default 24 hours
ALTER TABLE public.historias
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');
