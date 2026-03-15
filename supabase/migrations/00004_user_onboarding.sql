-- ==========================================
-- SMARTUNE: USER ONBOARDING & PROFILE
-- ==========================================

-- Agregar campos adicionales a la tabla usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS instrumento VARCHAR(50),
ADD COLUMN IF NOT EXISTS gustos_musicales TEXT[];

-- Asegurar que las políticas de RLS permiten actualización
-- (Ya existen en 00001_initial_schema.sql, pero verificamos)
-- CREATE POLICY "Users can update their own profile" ON public.usuarios
--     FOR UPDATE USING (auth.uid() = id);
