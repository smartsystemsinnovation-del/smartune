-- ==============================================================
-- Idempotent setup for Social Network Feed
-- ==============================================================

-- 1. Create posts table if not exists and ensure columns
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure image_url exists if the table was created previously without it
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Create likes table if not exists 
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case uniqueness was not set, attempt to add it (skip if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_post_id_user_id_key'
  ) THEN
    ALTER TABLE public.likes ADD CONSTRAINT likes_post_id_user_id_key UNIQUE(post_id, user_id);
  END IF;
END $$;

-- 3. Create post_comments table if not exists
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 5. Clean up old policies before recreating uniquely
DO $$
BEGIN
    DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
    DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
    DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
    DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
    
    DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
    DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
    DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
    
    DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
    DROP POLICY IF EXISTS "Users can insert their own comments" ON public.post_comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
END $$;

-- 6. Recreate Policies
-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- 7. Create/Replace view for posts with metrics and user info
CREATE OR REPLACE VIEW public.vw_posts_with_details AS
SELECT 
  p.id,
  p.content,
  p.image_url,
  p.created_at,
  p.user_id,
  u.nombre as username,
  u.avatar_url,
  u.rol,
  COALESCE((SELECT count(*) FROM public.likes l WHERE l.post_id = p.id), 0) as likes_count,
  COALESCE((SELECT count(*) FROM public.post_comments c WHERE c.post_id = p.id), 0) as comments_count
FROM public.posts p
JOIN public.usuarios u ON p.user_id = u.id;

-- 8. Create storage bucket for post images (DO NOTHING on error)
INSERT INTO storage.buckets (id, name, public) VALUES ('posts_images', 'posts_images', true) ON CONFLICT(id) DO NOTHING;

-- 9. Clean up and Recreate Bucket Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "posts_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "posts_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "posts_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "posts_images_delete" ON storage.objects;
END $$;

CREATE POLICY "posts_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'posts_images');
CREATE POLICY "posts_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts_images' AND auth.role() = 'authenticated');
CREATE POLICY "posts_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'posts_images' AND auth.role() = 'authenticated');
CREATE POLICY "posts_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'posts_images' AND auth.role() = 'authenticated');
