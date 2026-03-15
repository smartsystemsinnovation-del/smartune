-- ==========================================
-- SMARTUNE: MUSIC SWIPE PERSISTENCE
-- ==========================================

-- Tabla: favoritos (MusicSwipe Liked Songs)
CREATE TABLE public.favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    youtube_id VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    artista VARCHAR(255) NOT NULL,
    cover_url TEXT,
    fecha_like TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Evitar duplicados del mismo usuario para la misma canción
    UNIQUE(usuario_id, youtube_id)
);

-- Habilitar RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own favorites" ON public.favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can add their own favorites" ON public.favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can remove their own favorites" ON public.favoritos
    FOR DELETE USING (auth.uid() = usuario_id);
