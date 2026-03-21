-- Migration: Strict RLS for Social Network Feed
-- Ensuring anonymous users cannot read feed data unless authenticated

-- Posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by authenticated users" ON public.posts 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
CREATE POLICY "Likes are viewable by authenticated users" ON public.likes 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Comments are viewable by authenticated users" ON public.post_comments 
  FOR SELECT USING (auth.role() = 'authenticated');
