-- =======================================================
-- SMARTUNE: MINIGAME STATISTICS SCHEMA & RLS POLICIES
-- =======================================================

CREATE TABLE IF NOT EXISTS public.minigame_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    game_id VARCHAR(50) NOT NULL, -- 'pitch-finder', 'sight-reading-dash', 'smar-tiles'
    score INTEGER NOT NULL,
    accuracy NUMERIC(5,2), -- Nullable for games like Smar-Tiles
    difficulty VARCHAR(20), -- Nullable, e.g. 'easy', 'medium', 'hard'
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    shared BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.minigame_stats ENABLE ROW LEVEL SECURITY;

-- 1. Policies: Users can insert their own stats
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.minigame_stats;
CREATE POLICY "Users can insert their own stats" 
ON public.minigame_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Policies: Users can view their own stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.minigame_stats;
CREATE POLICY "Users can view their own stats" 
ON public.minigame_stats FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Policies: Users can update their own stats (e.g. toggle sharing status)
DROP POLICY IF EXISTS "Users can update their own stats" ON public.minigame_stats;
CREATE POLICY "Users can update their own stats" 
ON public.minigame_stats FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Policies: Connected teachers can view their students' shared stats
DROP POLICY IF EXISTS "Teachers can view shared student stats" ON public.minigame_stats;
CREATE POLICY "Teachers can view shared student stats" 
ON public.minigame_stats FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.student_teacher_connections c
        WHERE c.teacher_id = auth.uid() 
          AND c.student_id = minigame_stats.user_id
          AND c.status = 'accepted'
    ) AND shared = TRUE
);
