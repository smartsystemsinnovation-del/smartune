-- 1. Create seguidores table
CREATE TABLE IF NOT EXISTS public.seguidores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seguidor_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
    seguido_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(seguidor_id, seguido_id)
);

-- Enable RLS for seguidores
ALTER TABLE public.seguidores ENABLE ROW LEVEL SECURITY;

-- Policies for seguidores
CREATE POLICY "Users can see all followers/followings" ON public.seguidores
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.seguidores
    FOR INSERT WITH CHECK (auth.uid() = seguidor_id);

CREATE POLICY "Users can unfollow others" ON public.seguidores
    FOR DELETE USING (auth.uid() = seguidor_id);

-- 2. Create historias table (Stories)
CREATE TABLE IF NOT EXISTS public.historias (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Enable RLS for historias
ALTER TABLE public.historias ENABLE ROW LEVEL SECURITY;

-- Policies for historias
CREATE POLICY "Users can see active stories" ON public.historias
    FOR SELECT USING (expires_at > now());

CREATE POLICY "Users can create their own stories" ON public.historias
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own stories" ON public.historias
    FOR DELETE USING (auth.uid() = usuario_id);

-- 3. Update the storage buckets for historias
-- Note: Assuming storage setup is handled or bucket "historias" already created via UI, 
-- but we can add bucket policies if it exists. We'll rely on the API to insert.
